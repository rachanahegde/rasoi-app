import React, { useMemo } from 'react';
import {
    CalendarDays,
    X,
    ChefHat,
    Clock,
    Trash2,
    Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const WeeklyCalendar = ({
    recipes,
    mealPlan,
    selectedDate,
    onDateSelect,
    onAddRecipe,
    onRemoveRecipe,
    navigateTo,
    compact = false
}) => {
    const currentDate = useMemo(() => new Date(selectedDate), [selectedDate]);

    // Helper to get days for the week grid
    const calendarDays = useMemo(() => {
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
    }, [currentDate]);

    const selectedDateKey = selectedDate.toDateString();
    const todaysMeals = mealPlan[selectedDateKey] || [];

    return (
        <div className="paper-card p-1 bg-card relative overflow-hidden flex-1 rounded-xl shadow-sm border border-border h-full flex flex-col">
            {/* Spiral Binding Effect */}
            <div className="absolute top-0 left-4 bottom-0 w-8 border-r-2 border-dashed border-border flex flex-col gap-4 py-4 items-center opacity-20 pointer-events-none">
                {[...Array(10)].map((_, i) => <div key={i} className="w-3 h-3 rounded-full bg-primary"></div>)}
            </div>

            <div className="pl-12 pr-6 py-6 h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-serif font-bold text-xl text-foreground flex items-center gap-2">
                        <CalendarDays className="w-5 h-5 text-muted-foreground" />
                        Weekly Log
                    </h3>
                    <div className="text-xs font-serif italic text-muted-foreground">{selectedDate.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</div>
                </div>

                {/* Date Grid */}
                <div className="grid grid-cols-7 gap-1 mb-6">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                        <div key={i} className="text-center text-[10px] font-bold text-muted-foreground uppercase">{d}</div>
                    ))}
                    {calendarDays.map((d, i) => {
                        const isSelected = d.toDateString() === selectedDate.toDateString();
                        const isToday = d.toDateString() === new Date().toDateString();
                        const hasPlan = mealPlan[d.toDateString()]?.length > 0;

                        return (
                            <div
                                key={i}
                                onClick={() => onDateSelect(d)}
                                className={`
                  h-10 w-full flex flex-col items-center justify-center rounded-md text-sm font-serif transition-all cursor-pointer relative
                  ${isSelected ? 'bg-primary text-primary-foreground shadow-md z-10' : 'text-muted-foreground hover:bg-muted'}
                  ${isToday && !isSelected ? 'border border-border' : ''}
                `}
                            >
                                {d.getDate()}
                                {hasPlan && !isSelected && <div className="w-1 h-1 rounded-full bg-primary mt-1" />}
                            </div>
                        )
                    })}
                </div>

                {/* Selected Day Plan */}
                <div className="space-y-3 border-t-2 border-border pt-4 flex-1 overflow-y-auto">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        Entries for {selectedDate.toLocaleDateString(undefined, { weekday: 'short' })}
                    </h4>

                    {/* List Scheduled Meals */}
                    {todaysMeals.length > 0 ? (
                        todaysMeals.map((recipeId, idx) => {
                            const r = recipes.find(recipe => recipe.id === recipeId);
                            if (!r) return null;
                            return (
                                <div key={idx} className="group relative pl-2 py-2 cursor-pointer border-b border-border/50 last:border-0 hover:bg-muted/50 rounded-md transition-colors" onClick={() => navigateTo('detail', r.id)}>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2 flex-1 min-w-0 pr-6">
                                            {r.image && <img src={r.image} className="w-6 h-6 rounded-md object-cover border border-border" alt="" />}
                                            <div className="font-serif font-medium text-foreground group-hover:text-primary transition-colors truncate">
                                                {r.title}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onRemoveRecipe(selectedDate, idx); }}
                                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity p-1"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-4 text-muted-foreground text-sm font-serif italic border-2 border-dashed border-border rounded-lg text-center bg-muted/50">
                            Empty page...
                        </div>
                    )}

                    {/* Quick Add Section */}
                    <div className="mt-6 pt-4 border-t border-border">
                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Quick Add Favorites</h4>
                        <div className="space-y-2">
                            {recipes.filter(r => r.favorite).slice(0, 3).map(recipe => (
                                <div
                                    key={recipe.id}
                                    onClick={() => onAddRecipe(selectedDate, recipe.id)}
                                    className="flex items-center justify-between p-2 rounded-md border border-border hover:border-primary/20 hover:bg-primary/5 cursor-pointer transition-colors group"
                                >
                                    <span className="text-xs font-medium text-foreground truncate">{recipe.title}</span>
                                    <Plus className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" />
                                </div>
                            ))}
                            {recipes.filter(r => r.favorite).length === 0 && (
                                <div className="text-center text-xs text-muted-foreground italic">
                                    No favorites yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeeklyCalendar;
