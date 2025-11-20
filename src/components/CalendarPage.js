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

const CalendarPage = ({ recipes, mealPlan, setMealPlan, navigateTo }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'
    const [selectedDay, setSelectedDay] = useState(new Date());
    const [showGroceryList, setShowGroceryList] = useState(false);
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const [draggedRecipe, setDraggedRecipe] = useState(null);

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

        // For month view
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

        // Pad end
        const remaining = 42 - days.length; // 6 rows * 7 cols
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
    };

    const removeRecipeFromDate = (date, indexToRemove) => {
        const dateKey = date.toDateString();
        const currentPlan = mealPlan[dateKey] || [];
        const newPlan = [...currentPlan];
        newPlan.splice(indexToRemove, 1);

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
        // For simplicity, let's generate for the currently visible week/month or selected day
        // Let's do it for the selected week if in week view, or just selected day

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
                        } else {
                            ingredients[name] = { name: ing, count: 1, checked: false };
                        }
                    });
                }
            });
        });

        return Object.values(ingredients).sort((a, b) => a.name.localeCompare(b.name));
    }, [mealPlan, recipes, calendarDays, selectedDay, viewMode]);

    return (
        <div className="flex h-[calc(100vh-6rem)] gap-6 animate-in fade-in duration-500">
            {/* Main Calendar Area */}
            <div className="flex-1 flex flex-col bg-[#FFFDF5] rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                {/* Calendar Header */}
                <div className="p-6 border-b border-stone-200 flex justify-between items-center bg-[#FDFCF8]">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-serif font-bold text-stone-800">
                            {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                        </h2>
                        <div className="flex items-center bg-stone-100 rounded-lg p-1 border border-stone-200">
                            <button
                                onClick={() => setViewMode('week')}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${viewMode === 'week' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700'}`}
                            >
                                Week
                            </button>
                            <button
                                onClick={() => setViewMode('month')}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${viewMode === 'month' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700'}`}
                            >
                                Month
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => navigateCalendar(-1)}>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date())}>
                            Today
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
                <div className={`flex-1 grid ${viewMode === 'week' ? 'grid-cols-7' : 'grid-cols-7 grid-rows-6'} bg-stone-200 gap-px overflow-y-auto`}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <div key={day} className="bg-[#FDFCF8] p-2 text-center text-xs font-bold text-stone-400 uppercase tracking-wider sticky top-0 z-10">
                            {day}
                        </div>
                    ))}

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
                  bg-white min-h-[100px] p-2 transition-colors cursor-pointer relative group
                  ${!isCurrentMonth && viewMode === 'month' ? 'bg-stone-50/50 text-stone-400' : ''}
                  ${isSelected ? 'ring-2 ring-inset ring-orange-300 bg-orange-50/30' : 'hover:bg-stone-50'}
                `}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`
                    w-7 h-7 flex items-center justify-center rounded-full text-sm font-serif
                    ${isToday ? 'bg-stone-800 text-white shadow-md' : 'text-stone-600'}
                  `}>
                                        {date.getDate()}
                                    </span>
                                    {dayRecipes.length > 0 && (
                                        <Badge variant="secondary" className="text-[10px] px-1.5 h-5 bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200">
                                            {dayRecipes.length}
                                        </Badge>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    {dayRecipes.map((rId, idx) => {
                                        const recipe = recipes.find(r => r.id === rId);
                                        if (!recipe) return null;
                                        return (
                                            <div key={`${dateKey}-${idx}`} className="text-xs p-1.5 rounded bg-white border border-stone-200 shadow-sm truncate font-medium text-stone-700 flex items-center gap-1 group/item">
                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-300 shrink-0" />
                                                <span className="truncate">{recipe.title}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Add Button on Hover */}
                                <button className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-stone-100 text-stone-400 hover:bg-orange-100 hover:text-orange-600 items-center justify-center hidden group-hover:flex transition-colors">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Side Panel (Day Detail or Grocery List) */}
            {(isPanelOpen || showGroceryList) && (
                <div className="w-96 bg-white rounded-xl shadow-xl border border-stone-200 flex flex-col animate-in slide-in-from-right duration-300">
                    {showGroceryList ? (
                        // Grocery List View
                        <>
                            <div className="p-6 border-b border-stone-200 flex justify-between items-center bg-[#FDFCF8] rounded-t-xl">
                                <div>
                                    <h3 className="font-serif font-bold text-xl text-stone-800">Grocery List</h3>
                                    <p className="text-xs text-stone-500 mt-1">Based on {viewMode === 'week' ? 'this week' : 'selected day'}</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setShowGroceryList(false)}>
                                    <X className="w-5 h-5 text-stone-400" />
                                </Button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6">
                                {groceryList.length > 0 ? (
                                    <div className="space-y-3">
                                        {groceryList.map((item, idx) => (
                                            <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-stone-100 hover:border-stone-200 hover:bg-stone-50 transition-colors group">
                                                <div className="mt-0.5 w-5 h-5 rounded border border-stone-300 flex items-center justify-center cursor-pointer hover:border-orange-400">
                                                    {/* Checkbox logic would go here */}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-stone-800 capitalize">{item.name}</p>
                                                    {item.count > 1 && <span className="text-xs text-stone-400">x{item.count} recipes</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-stone-400 italic">
                                        <ShoppingBasket className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p>No ingredients needed yet.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        // Day Detail View
                        <>
                            <div className="p-6 border-b border-stone-200 flex justify-between items-center bg-[#FDFCF8] rounded-t-xl">
                                <div>
                                    <h3 className="font-serif font-bold text-xl text-stone-800">
                                        {selectedDay.toLocaleDateString(undefined, { weekday: 'long' })}
                                    </h3>
                                    <p className="text-stone-500 text-sm">{selectedDay.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setIsPanelOpen(false)}>
                                    <X className="w-5 h-5 text-stone-400" />
                                </Button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {/* Scheduled Meals */}
                                <div>
                                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">Scheduled Meals</h4>
                                    <div className="space-y-4">
                                        {(mealPlan[selectedDay.toDateString()] || []).length > 0 ? (
                                            (mealPlan[selectedDay.toDateString()] || []).map((rId, idx) => {
                                                const recipe = recipes.find(r => r.id === rId);
                                                if (!recipe) return null;
                                                return (
                                                    <div key={idx} className="bg-white border border-stone-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow group">
                                                        <div className="flex gap-3">
                                                            <div className="w-16 h-16 rounded-md bg-stone-100 overflow-hidden shrink-0">
                                                                {/* Placeholder for image */}
                                                                <div className="w-full h-full flex items-center justify-center text-stone-300 bg-stone-100">
                                                                    <ChefHat className="w-8 h-8" />
                                                                </div>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h5 className="font-serif font-bold text-stone-800 truncate cursor-pointer hover:text-orange-600" onClick={() => navigateTo('detail', recipe.id)}>
                                                                    {recipe.title}
                                                                </h5>
                                                                <div className="flex items-center gap-3 mt-1 text-xs text-stone-500">
                                                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {recipe.prepTime || '30m'}</span>
                                                                    <span className="px-1.5 py-0.5 rounded-full bg-stone-100 border border-stone-200">Dinner</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col justify-between items-end">
                                                                <button
                                                                    onClick={() => removeRecipeFromDate(selectedDay, idx)}
                                                                    className="text-stone-300 hover:text-red-400 transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-center py-8 border-2 border-dashed border-stone-200 rounded-lg bg-stone-50/50">
                                                <p className="text-stone-400 italic text-sm">No meals planned.</p>
                                                <Button variant="link" className="text-orange-500 text-sm mt-1" onClick={() => navigateTo('recipes')}>
                                                    Browse Recipes
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Add Suggestions (Favorites) */}
                                <div>
                                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">Quick Add Favorites</h4>
                                    <div className="grid grid-cols-1 gap-2">
                                        {recipes.filter(r => r.favorite).slice(0, 3).map(recipe => (
                                            <div
                                                key={recipe.id}
                                                onClick={() => addRecipeToDate(selectedDay, recipe.id)}
                                                className="flex items-center justify-between p-2 rounded-md border border-stone-100 hover:border-orange-200 hover:bg-orange-50 cursor-pointer transition-colors group"
                                            >
                                                <span className="text-sm font-medium text-stone-700 truncate">{recipe.title}</span>
                                                <Plus className="w-4 h-4 text-stone-300 group-hover:text-orange-500" />
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
