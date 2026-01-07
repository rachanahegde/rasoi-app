import React, { useState, useEffect, useMemo } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Plus,
    X,
    Clock,
    ChefHat,
    ShoppingBasket,
    Check,
    MoreHorizontal,
    Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useActivityLog } from '@/context/ActivityLogContext';

const CalendarPage = ({ recipes, mealPlan, setMealPlan, groceryState, setGroceryState, navigateTo }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'
    const [selectedDay, setSelectedDay] = useState(new Date());
    const [showGroceryList, setShowGroceryList] = useState(false);
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const [draggedRecipe, setDraggedRecipe] = useState(null);
    const [draggedGroceryItem, setDraggedGroceryItem] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [draggedMealItem, setDraggedMealItem] = useState(null);
    const [dragOverMealIndex, setDragOverMealIndex] = useState(null);
    const { addActivity } = useActivityLog();

    // Helper to get days for the grid
    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // For week view
        if (viewMode === 'week') {
            const curr = new Date(currentDate);
            const day = curr.getDay();
            const diff = curr.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
            const monday = new Date(curr.setDate(diff));

            const days = [];
            for (let i = 0; i < 7; i++) {
                const d = new Date(monday);
                d.setDate(monday.getDate() + i);
                days.push(d);
            }
            return days;
        }

        // For month view - use 5 rows instead of 6 to minimize padding days
        const days = [];
        // Pad start
        const startPadding = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
        for (let i = 0; i < startPadding; i++) {
            const d = new Date(year, month, 0 - i);
            days.unshift(d);
        }

        // Days of month
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }

        // Pad end to complete 5 rows (35 days total)
        const remaining = 35 - days.length; // 5 rows * 7 cols
        for (let i = 1; i <= remaining; i++) {
            days.push(new Date(year, month + 1, i));
        }

        return days;
    }, [currentDate, viewMode]);

    const navigateCalendar = (direction) => {
        const newDate = new Date(currentDate);
        if (viewMode === 'week') {
            newDate.setDate(newDate.getDate() + (direction * 7));
        } else {
            newDate.setMonth(newDate.getMonth() + direction);
        }
        setCurrentDate(newDate);
    };

    const handleDayClick = (day) => {
        setSelectedDay(day);
        setIsPanelOpen(true);
    };

    const handleDrop = (e, date) => {
        e.preventDefault();
        const recipeId = e.dataTransfer.getData('recipeId');
        if (recipeId) {
            addRecipeToDate(date, recipeId);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const addRecipeToDate = (date, recipeId) => {
        const dateKey = date.toDateString();
        const currentPlan = mealPlan[dateKey] || [];
        setMealPlan({
            ...mealPlan,
            [dateKey]: [...currentPlan, recipeId]
        });

        // Log activity
        const recipe = recipes.find(r => r.id === recipeId);
        if (recipe) {
            const dateStr = date.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric'
            });
            addActivity('meal_planned', `Planned "${recipe.title}" for ${dateStr}`);
        }
    };

    const removeRecipeFromDate = (date, indexToRemove) => {
        const dateKey = date.toDateString();
        const currentPlan = mealPlan[dateKey] || [];
        const recipeId = currentPlan[indexToRemove];
        const newPlan = [...currentPlan];
        newPlan.splice(indexToRemove, 1);

        // Log activity before removing
        const recipe = recipes.find(r => r.id === recipeId);
        if (recipe) {
            const dateStr = date.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric'
            });
            addActivity('meal_removed', `Removed "${recipe.title}" from ${dateStr}`);
        }

        if (newPlan.length === 0) {
            const { [dateKey]: deleted, ...rest } = mealPlan;
            setMealPlan(rest);
        } else {
            setMealPlan({
                ...mealPlan,
                [dateKey]: newPlan
            });
        }
    };

    // Grocery List Logic
    const groceryList = useMemo(() => {
        const ingredients = {};

        // Get relevant dates based on view or selection
        const datesToInclude = viewMode === 'week' ? calendarDays : [selectedDay];

        datesToInclude.forEach(date => {
            const dateKey = date.toDateString();
            const dayRecipes = mealPlan[dateKey] || [];

            dayRecipes.forEach(rId => {
                const recipe = recipes.find(r => r.id === rId);
                if (recipe) {
                    recipe.ingredients.forEach(ing => {
                        // Simple normalization
                        const name = ing.toLowerCase().trim();
                        if (ingredients[name]) {
                            ingredients[name].count++;
                            if (!ingredients[name].recipes.find(r => r.id === recipe.id)) {
                                ingredients[name].recipes.push({ id: recipe.id, title: recipe.title });
                            }
                        } else {
                            ingredients[name] = {
                                id: name,
                                name: ing,
                                count: 1,
                                checked: !!groceryState[name],
                                recipes: [{ id: recipe.id, title: recipe.title }]
                            };
                        }
                    });
                }
            });
        });

        const itemsArray = Object.values(ingredients);

        // Get custom order from groceryState
        const customOrder = groceryState['_order'] || [];

        // Sort by custom order if it exists, otherwise by checked status and name
        if (customOrder.length > 0) {
            return itemsArray.sort((a, b) => {
                const aIndex = customOrder.indexOf(a.id);
                const bIndex = customOrder.indexOf(b.id);

                // If both have custom positions, use those
                if (aIndex !== -1 && bIndex !== -1) {
                    return aIndex - bIndex;
                }
                // If only one has a custom position, it goes first
                if (aIndex !== -1) return -1;
                if (bIndex !== -1) return 1;

                // Otherwise, use default sorting
                if (a.checked === b.checked) return a.name.localeCompare(b.name);
                return a.checked ? 1 : -1;
            });
        }

        return itemsArray.sort((a, b) => {
            if (a.checked === b.checked) return a.name.localeCompare(b.name);
            return a.checked ? 1 : -1;
        });
    }, [mealPlan, recipes, calendarDays, selectedDay, viewMode, groceryState]);

    const toggleGroceryItem = (name) => {
        setGroceryState(prev => ({
            ...prev,
            [name]: !prev[name]
        }));
    };

    // Drag and drop handlers for grocery list
    const handleGroceryDragStart = (e, item, index) => {
        setDraggedGroceryItem({ item, index });
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleGroceryDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverIndex(index);
    };

    const handleGroceryDrop = (e, dropIndex) => {
        e.preventDefault();

        if (draggedGroceryItem === null || draggedGroceryItem.index === dropIndex) {
            setDraggedGroceryItem(null);
            setDragOverIndex(null);
            return;
        }

        // Reorder the list
        const newList = [...groceryList];
        const [removed] = newList.splice(draggedGroceryItem.index, 1);
        newList.splice(dropIndex, 0, removed);

        // Save the new order
        const newOrder = newList.map(item => item.id);
        setGroceryState(prev => ({
            ...prev,
            '_order': newOrder
        }));

        setDraggedGroceryItem(null);
        setDragOverIndex(null);
    };

    const handleGroceryDragEnd = () => {
        setDraggedGroceryItem(null);
        setDragOverIndex(null);
    };

    // Drag handlers for scheduled meals
    const handleMealDragStart = (e, index) => {
        setDraggedMealItem(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleMealDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverMealIndex(index);
    };

    const handleMealDrop = (e, dropIndex) => {
        e.preventDefault();

        if (draggedMealItem === null || draggedMealItem === dropIndex) {
            setDraggedMealItem(null);
            setDragOverMealIndex(null);
            return;
        }

        const dateKey = selectedDay.toDateString();
        const currentMeals = mealPlan[dateKey] || [];
        const newMeals = [...currentMeals];

        // Reorder the meals
        const [removed] = newMeals.splice(draggedMealItem, 1);
        newMeals.splice(dropIndex, 0, removed);

        // Update meal plan
        setMealPlan({
            ...mealPlan,
            [dateKey]: newMeals
        });

        setDraggedMealItem(null);
        setDragOverMealIndex(null);
    };

    const handleMealDragEnd = () => {
        setDraggedMealItem(null);
        setDragOverMealIndex(null);
    };

    return (
        <div className="flex h-[calc(100vh-6rem)] gap-6 animate-in fade-in duration-500">
            {/* Main Calendar Area */}
            <div className="flex-1 flex flex-col bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                {/* Calendar Header */}
                <div className="p-6 border-b border-border flex justify-between items-center bg-card">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-serif font-bold text-foreground">
                            {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                        </h2>
                        <div className="flex items-center bg-muted rounded-lg p-1 border border-border">
                            <button
                                onClick={() => setViewMode('week')}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${viewMode === 'week' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Week
                            </button>
                            <button
                                onClick={() => setViewMode('month')}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${viewMode === 'month' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Month
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => navigateCalendar(-1)}>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date())} title="Today">
                            <CalendarIcon className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => navigateCalendar(1)}>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                        <Button
                            variant={showGroceryList ? "primary" : "outline"}
                            onClick={() => setShowGroceryList(!showGroceryList)}
                            className="ml-2"
                        >
                            <ShoppingBasket className="w-4 h-4 mr-2" /> Grocery List
                        </Button>
                    </div>
                </div>

                {/* Calendar Grid */}
                {viewMode === 'week' ? (
                    <div className="flex-1 flex flex-col bg-border gap-px overflow-hidden">
                        {/* Header Row - Fixed Height */}
                        <div className="grid grid-cols-7 bg-border gap-px h-6 shrink-0">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                <div key={day} className="bg-card flex items-center justify-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Day Cells - Flex to fill remaining space */}
                        <div className="flex-1 grid grid-cols-7 bg-border gap-px overflow-y-auto">
                            {calendarDays.map((date, i) => {
                                const isToday = date.toDateString() === new Date().toDateString();
                                const isSelected = selectedDay && date.toDateString() === selectedDay.toDateString();
                                const dateKey = date.toDateString();
                                const dayRecipes = mealPlan[dateKey] || [];

                                return (
                                    <div
                                        key={i}
                                        onClick={() => handleDayClick(date)}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, date)}
                                        className={`
                                            bg-background p-2 transition-colors cursor-pointer relative group h-full
                                            ${isSelected ? 'ring-2 ring-inset ring-primary bg-primary/10' : 'hover:bg-muted'}
                                        `}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`
                                                w-7 h-7 flex items-center justify-center rounded-full text-sm font-serif
                                                ${isToday ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground'}
                                            `}>
                                                {date.getDate()}
                                            </span>
                                            {dayRecipes.length > 0 && (
                                                <Badge variant="secondary" className="text-[10px] px-1.5 h-5 bg-accent text-accent-foreground hover:bg-accent/90 border-accent">
                                                    {dayRecipes.length}
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            {dayRecipes.map((rId, idx) => {
                                                const recipe = recipes.find(r => r.id === rId);
                                                if (!recipe) return null;
                                                return (
                                                    <div key={`${dateKey}-${idx}`} className="text-xs p-1.5 rounded bg-background border border-border shadow-sm truncate font-medium text-foreground flex items-center gap-2 group/item">
                                                        {recipe.image ? (
                                                            <img src={recipe.image} className="w-5 h-5 rounded-full object-cover shrink-0" alt="" />
                                                        ) : (
                                                            <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                                        )}
                                                        <span className="truncate">{recipe.title}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Add Button on Hover */}
                                        <button className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary items-center justify-center hidden group-hover:flex transition-colors">
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col bg-border gap-px overflow-hidden">
                        {/* Header Row - Fixed Height */}
                        <div className="grid grid-cols-7 bg-border gap-px h-6 shrink-0">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                <div key={day} className="bg-card flex items-center justify-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Day Cells - 5 rows grid */}
                        <div className="flex-1 grid grid-cols-7 grid-rows-5 bg-border gap-px overflow-y-auto">
                            {calendarDays.map((date, i) => {
                                const isToday = date.toDateString() === new Date().toDateString();
                                const isSelected = selectedDay && date.toDateString() === selectedDay.toDateString();
                                const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                                const dateKey = date.toDateString();
                                const dayRecipes = mealPlan[dateKey] || [];

                                return (
                                    <div
                                        key={i}
                                        onClick={() => handleDayClick(date)}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, date)}
                                        className={`
                                        bg-background p-2 transition-colors cursor-pointer relative group flex flex-col h-full
                                        ${!isCurrentMonth ? 'bg-muted/50 text-muted-foreground' : ''}
                                        ${isSelected ? 'ring-2 ring-inset ring-primary bg-primary/10' : 'hover:bg-muted'}
                                    `}
                                    >
                                        {/* Header - Date and Badge (Fixed) */}
                                        <div className="flex justify-between items-start mb-2 shrink-0">
                                            <span className={`
                                            w-7 h-7 flex items-center justify-center rounded-full text-sm font-serif
                                            ${isToday ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground'}
                                        `}>
                                                {date.getDate()}
                                            </span>
                                            {dayRecipes.length > 0 && (
                                                <Badge variant="secondary" className="text-[10px] px-1.5 h-5 bg-accent text-accent-foreground hover:bg-accent/90 border-accent">
                                                    {dayRecipes.length}
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Recipe List - Scrollable */}
                                        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar min-h-0">
                                            {dayRecipes.map((rId, idx) => {
                                                const recipe = recipes.find(r => r.id === rId);
                                                if (!recipe) return null;
                                                return (
                                                    <div key={`${dateKey}-${idx}`} className="text-xs p-1.5 rounded bg-background border border-border shadow-sm truncate font-medium text-foreground flex items-center gap-2 group/item">
                                                        {recipe.image ? (
                                                            <img src={recipe.image} className="w-5 h-5 rounded-full object-cover shrink-0" alt="" />
                                                        ) : (
                                                            <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                                        )}
                                                        <span className="truncate">{recipe.title}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Add Button on Hover */}
                                        <button className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary items-center justify-center hidden group-hover:flex transition-colors">
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Side Panel (Day Detail or Grocery List) */}
            {(isPanelOpen || showGroceryList) && (
                <div className="w-96 bg-card rounded-xl shadow-xl border border-border flex flex-col animate-in slide-in-from-right duration-300">
                    {showGroceryList ? (
                        // Grocery List View
                        <>
                            <div className="p-6 border-b border-border flex justify-between items-center bg-card rounded-t-xl">
                                <div>
                                    <h3 className="font-serif font-bold text-xl text-foreground">Grocery List</h3>
                                    <p className="text-xs text-muted-foreground mt-1">Based on {viewMode === 'week' ? 'this week' : 'selected day'}</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setShowGroceryList(false)}>
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </Button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6">
                                {groceryList.length > 0 ? (
                                    <div className="space-y-3">
                                        {groceryList.map((item, index) => (
                                            <div
                                                key={item.id}
                                                draggable
                                                onDragStart={(e) => handleGroceryDragStart(e, item, index)}
                                                onDragOver={(e) => handleGroceryDragOver(e, index)}
                                                onDrop={(e) => handleGroceryDrop(e, index)}
                                                onDragEnd={handleGroceryDragEnd}
                                                className={`
                                                    flex items-start gap-3 p-3 rounded-lg border transition-all group cursor-move
                                                    ${item.checked ? 'bg-muted border-border' : 'bg-card border-border hover:border-primary/50'}
                                                    ${draggedGroceryItem?.index === index ? 'opacity-50' : ''}
                                                    ${dragOverIndex === index && draggedGroceryItem?.index !== index ? 'border-primary border-2 scale-105' : ''}
                                                `}
                                            >
                                                {/* Drag Handle */}
                                                <div className="mt-1 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                                                    <MoreHorizontal className="w-4 h-4 rotate-90" />
                                                </div>

                                                <div
                                                    className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors cursor-pointer ${item.checked ? 'bg-primary border-primary text-primary-foreground' : 'border-input group-hover:border-primary'}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleGroceryItem(item.id);
                                                    }}
                                                >
                                                    {item.checked && <Check className="w-3.5 h-3.5" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className={`text-sm font-medium capitalize transition-colors ${item.checked ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                                            {item.name}
                                                        </p>
                                                        {item.count > 1 && (
                                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                                                                ×{item.count}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {item.recipes.map(r => (
                                                            <span key={r.id} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground truncate max-w-full">
                                                                {r.title}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground italic">
                                        <ShoppingBasket className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p>No ingredients needed yet.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        // Day Detail View
                        <>
                            <div className="p-6 border-b border-border flex justify-between items-center bg-card rounded-t-xl">
                                <div>
                                    <h3 className="font-serif font-bold text-xl text-foreground">
                                        {selectedDay.toLocaleDateString(undefined, { weekday: 'long' })}
                                    </h3>
                                    <p className="text-muted-foreground text-sm">{selectedDay.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setIsPanelOpen(false)}>
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </Button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* Scheduled Meals */}
                                <div>
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Scheduled Meals</h4>
                                    <div className="space-y-4">
                                        {(mealPlan[selectedDay.toDateString()] || []).length > 0 ? (
                                            (mealPlan[selectedDay.toDateString()] || []).map((rId, idx) => {
                                                const recipe = recipes.find(r => r.id === rId);
                                                if (!recipe) return null;
                                                return (
                                                    <div
                                                        key={idx}
                                                        draggable
                                                        onDragStart={(e) => handleMealDragStart(e, idx)}
                                                        onDragOver={(e) => handleMealDragOver(e, idx)}
                                                        onDrop={(e) => handleMealDrop(e, idx)}
                                                        onDragEnd={handleMealDragEnd}
                                                        className={`
                                                            bg-card border border-border rounded-lg p-3 shadow-sm hover:shadow-md transition-all group cursor-move
                                                            ${draggedMealItem === idx ? 'opacity-50' : ''}
                                                            ${dragOverMealIndex === idx && draggedMealItem !== idx ? 'border-primary border-2 scale-[1.02]' : ''}
                                                        `}
                                                    >
                                                        <div className="flex gap-3">
                                                            {/* Drag Handle */}
                                                            <div className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing mt-1">
                                                                <MoreHorizontal className="w-4 h-4 rotate-90" />
                                                            </div>

                                                            <div className="w-16 h-16 rounded-md bg-muted overflow-hidden shrink-0 border border-border">
                                                                {recipe.image ? (
                                                                    <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">
                                                                        <ChefHat className="w-8 h-8" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h5 className="font-serif font-bold text-foreground truncate cursor-pointer hover:text-primary" onClick={() => navigateTo('detail', recipe.id)}>
                                                                    {recipe.title}
                                                                </h5>
                                                                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {recipe.prepTime || '30m'}</span>
                                                                    <span className="px-1.5 py-0.5 rounded-full bg-muted border border-border">Dinner</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col justify-between items-end">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); removeRecipeFromDate(selectedDay, idx); }}
                                                                    className="text-muted-foreground hover:text-destructive transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-center py-8 border-2 border-dashed border-border rounded-lg bg-muted/50">
                                                <p className="text-muted-foreground italic text-sm">No meals planned.</p>
                                                <Button variant="link" className="text-primary text-sm mt-1" onClick={() => navigateTo('recipes')}>
                                                    Browse Recipes
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Add Suggestions (Favorites) */}
                                <div>
                                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Quick Add Favorites</h4>
                                    <div className="grid grid-cols-1 gap-2">
                                        {recipes.filter(r => r.favorite).slice(0, 3).map(recipe => (
                                            <div
                                                key={recipe.id}
                                                onClick={() => addRecipeToDate(selectedDay, recipe.id)}
                                                className="flex items-center justify-between p-2 rounded-md border border-border hover:border-primary/20 hover:bg-primary/5 cursor-pointer transition-colors group"
                                            >
                                                <span className="text-sm font-medium text-foreground truncate">{recipe.title}</span>
                                                <Plus className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default CalendarPage;
