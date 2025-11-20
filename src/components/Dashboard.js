import React from 'react';
import { Sparkles, CalendarDays, X, Heart, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RecipeCard from '@/components/RecipeCard';

const Dashboard = ({
    recipes,
    mealPlan,
    selectedDate,
    setSelectedDate,
    navigateTo,
    toggleFavorite,
    removeFromMealPlan,
    setSearchQuery
}) => {
    const today = new Date();
    const currentDay = today.getDay() === 0 ? 7 : today.getDay();
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - currentDay + i + 1);
        return d;
    });

    const selectedDateKey = selectedDate.toDateString();
    const todaysMeals = mealPlan[selectedDateKey] || [];
    const favoriteRecipes = recipes.filter(r => r.favorite);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header - Handwritten Style */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b-2 border-dashed border-stone-300">
                <div>
                    <div className="flex items-center gap-2 text-stone-500 mb-1 font-medium font-serif italic">
                        <span>Good morning, Chef</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif text-stone-800 leading-tight">
                        <span className="text-stone-400 font-light">Today's</span> <br />
                        Kitchen Notes
                    </h1>
                </div>
                <div className="flex gap-3">
                    <Button onClick={() => navigateTo('generate')} variant="primary" className="rounded-full px-6">
                        <Sparkles className="w-4 h-4 mr-2 text-orange-200" /> Draft New Idea
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Calendar / Journal Widget */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="paper-card p-1 bg-[#FFFDF5] relative overflow-hidden flex-1 rounded-xl shadow-sm border border-stone-200">
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
                                {weekDays.map((d, i) => {
                                    const isSelected = d.toDateString() === selectedDate.toDateString();
                                    const isToday = d.toDateString() === new Date().toDateString();
                                    const hasPlan = mealPlan[d.toDateString()]?.length > 0;

                                    return (
                                        <div
                                            key={i}
                                            onClick={() => setSelectedDate(d)}
                                            className={`
                            h-10 w-full flex flex-col items-center justify-center rounded-md text-sm font-serif transition-all cursor-pointer relative
                            ${isSelected ? 'bg-stone-800 text-[#FDFCF8] shadow-md z-10' : 'text-stone-600 hover:bg-stone-100'}
                            ${isToday && !isSelected ? 'border border-stone-300' : ''}
                          `}
                                        >
                                            {d.getDate()}
                                            {hasPlan && !isSelected && <div className="w-1 h-1 rounded-full bg-orange-400 mt-1" />}
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Selected Day Plan - Looks like handwritten entries */}
                            <div className="space-y-3 border-t-2 border-stone-100 pt-4 flex-1">
                                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                                    Entries for {selectedDate.toLocaleDateString(undefined, { weekday: 'short' })}
                                </h4>
                                {todaysMeals.length > 0 ? (
                                    todaysMeals.map((recipeId, idx) => {
                                        const r = recipes.find(recipe => recipe.id === recipeId);
                                        if (!r) return null;
                                        return (
                                            <div key={idx} className="group relative pl-6 py-2 cursor-pointer" onClick={() => navigateTo('detail', r.id)}>
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-full bg-stone-200 group-hover:bg-orange-300 transition-colors rounded-full"></div>
                                                <div className="font-serif font-medium text-stone-800 group-hover:text-orange-800 transition-colors">{r.title}</div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); removeFromMealPlan(selectedDateKey, recipeId); }}
                                                    className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-400 transition-opacity"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="py-4 text-stone-400 text-sm font-serif italic border-2 border-dashed border-stone-100 rounded-lg text-center bg-stone-50/50">
                                        Empty page...
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inspiration Cards - Polaroid / Sticker Style */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div onClick={() => { setSearchQuery('Summer'); navigateTo('recipes'); }} className="cursor-pointer bg-white p-3 rounded-xl shadow-sm rotate-[-1deg] hover:rotate-0 transition-transform duration-300 border border-stone-100">
                        <div className="bg-orange-50 rounded-lg overflow-hidden aspect-square mb-3 relative">
                            <img src="https://images.unsplash.com/photo-1544025162-d76690b67f61?auto=format&fit=crop&w=300&q=80" className="w-full h-full object-cover sepia-[.2]" alt="Grilling" />
                            <div className="absolute inset-0 bg-gradient-to-t from-orange-900/20 to-transparent"></div>
                        </div>
                        <div className="text-center">
                            <span className="font-serif font-bold text-lg text-stone-800">Summer Grilling</span>
                            <div className="h-1 w-12 bg-orange-200 mx-auto mt-1"></div>
                        </div>
                    </div>

                    <div onClick={() => { setSearchQuery('Cozy'); navigateTo('recipes'); }} className="cursor-pointer bg-white p-3 rounded-xl shadow-sm rotate-[1deg] hover:rotate-0 transition-transform duration-300 border border-stone-100">
                        <div className="bg-stone-100 rounded-lg overflow-hidden aspect-square mb-3 relative">
                            <img src="https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=300&q=80" className="w-full h-full object-cover sepia-[.2]" alt="Roasting" />
                        </div>
                        <div className="text-center">
                            <span className="font-serif font-bold text-lg text-stone-800">Slow Roasts</span>
                            <div className="h-1 w-12 bg-stone-300 mx-auto mt-1"></div>
                        </div>
                    </div>

                    <div onClick={() => { setSearchQuery('Sweet'); navigateTo('recipes'); }} className="cursor-pointer bg-white p-3 rounded-xl shadow-sm rotate-[-2deg] hover:rotate-0 transition-transform duration-300 border border-stone-100">
                        <div className="bg-blue-50 rounded-lg overflow-hidden aspect-square mb-3 relative">
                            <img src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80" className="w-full h-full object-cover sepia-[.2]" alt="Baking" />
                        </div>
                        <div className="text-center">
                            <span className="font-serif font-bold text-lg text-stone-800">Sweet Treats</span>
                            <div className="h-1 w-12 bg-blue-200 mx-auto mt-1"></div>
                        </div>
                    </div>
                </div>

                {/* Favorites */}
                <div className="lg:col-span-12 mt-4">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-serif font-bold text-stone-800 flex items-center gap-2">
                            <Heart className="w-5 h-5 text-red-400 fill-red-400" /> Loved Recipes
                        </h3>
                        <Button variant="ghost" onClick={() => navigateTo('recipes')} className="font-serif italic">View All Index <ChevronRight className="w-4 h-4 ml-1" /></Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favoriteRecipes.length > 0 ? favoriteRecipes.slice(0, 3).map(recipe => (
                            <RecipeCard key={recipe.id} recipe={recipe} onClick={() => navigateTo('detail', recipe.id)} onToggleFav={toggleFavorite} />
                        )) : (
                            <div className="col-span-full text-center py-12 bg-stone-50/50 rounded-xl border-2 border-dashed border-stone-200 text-stone-400 font-serif italic">
                                No favorites marked yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
