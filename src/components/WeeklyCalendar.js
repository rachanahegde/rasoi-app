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
        <div className="paper-card p-1 bg-[#FFFDF5] relative overflow-hidden flex-1 rounded-xl shadow-sm border border-stone-200 h-full flex flex-col">
            {/* Spiral Binding Effect */}
            <div className="absolute top-0 left-4 bottom-0 w-8 border-r-2 border-dashed border-stone-200 flex flex-col gap-4 py-4 items-center opacity-20 pointer-events-none">
                {[...Array(10)].map((_, i) => <div key={i} className="w-3 h-3 rounded-full bg-stone-800"></div>)}
            </div>

            <div className="pl-12 pr-6 py-6 h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-serif font-bold text-xl text-stone-800 flex items-center gap-2">
                        <CalendarDays className="w-5 h-5 text-stone-600" />
                        Weekly Log
                    </h3>
                    <div className="text-xs font-serif italic text-stone-500">{selectedDate.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</div>
                </div>

                {/* Date Grid */}
                <div className="grid grid-cols-7 gap-1 mb-6">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                        <div key={i} className="text-center text-[10px] font-bold text-stone-400 uppercase">{d}</div>
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
                  ${isSelected ? 'bg-stone-800 text-[#FDFCF8] shadow-md z-10' : 'text-stone-600 hover:bg-stone-100'}
                  ${isToday && !isSelected ? 'border border-stone-300' : ''}
                `}
                            >
                                {d.getDate()}
                                {hasPlan && !isSelected && <div className="w-1 h-1 rounded-full bg-[#6f1d1b] mt-1" />}
                            </div>
                        )
                    })}
                </div>

                {/* Selected Day Plan */}
                <div className="space-y-3 border-t-2 border-stone-100 pt-4 flex-1 overflow-y-auto">
                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                        Entries for {selectedDate.toLocaleDateString(undefined, { weekday: 'short' })}
                    </h4>

                    {/* List Scheduled Meals */}
                    {todaysMeals.length > 0 ? (
                        todaysMeals.map((recipeId, idx) => {
                            const r = recipes.find(recipe => recipe.id === recipeId);
                            if (!r) return null;
                            return (
                                <div key={idx} className="group relative pl-2 py-2 cursor-pointer border-b border-stone-50 last:border-0 hover:bg-stone-50 rounded-md transition-colors" onClick={() => navigateTo('detail', r.id)}>
                                    <div className="flex justify-between items-center">
                                        <div className="font-serif font-medium text-stone-800 group-hover:text-[#6f1d1b] transition-colors truncate pr-6">
                                            {r.title}
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onRemoveRecipe(selectedDate, idx); }}
                                            className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-400 transition-opacity p-1"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-4 text-stone-400 text-sm font-serif italic border-2 border-dashed border-stone-100 rounded-lg text-center bg-stone-50/50">
                            Empty page...
                        </div>
                    )}

                    {/* Quick Add Section */}
                    <div className="mt-6 pt-4 border-t border-stone-100">
                        <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-3">Quick Add Favorites</h4>
                        <div className="space-y-2">
                            {recipes.filter(r => r.favorite).slice(0, 3).map(recipe => (
                                <div
                                    key={recipe.id}
                                    onClick={() => onAddRecipe(selectedDate, recipe.id)}
                                    className="flex items-center justify-between p-2 rounded-md border border-stone-100 hover:border-[#6f1d1b]/20 hover:bg-[#6f1d1b]/5 cursor-pointer transition-colors group"
                                >
                                    <span className="text-xs font-medium text-stone-700 truncate">{recipe.title}</span>
                                    <Plus className="w-3.5 h-3.5 text-stone-300 group-hover:text-[#6f1d1b]" />
                                </div>
                            ))}
                            {recipes.filter(r => r.favorite).length === 0 && (
                                <div className="text-center text-xs text-stone-400 italic">
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
