import React from 'react';
import { Sparkles, CalendarDays, X, Heart, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RecipeCard from '@/components/RecipeCard';
import WeeklyCalendar from '@/components/WeeklyCalendar';
import RecentlyCooked from '@/components/RecentlyCooked';
import MealPrepSuggestions from '@/components/MealPrepSuggestions';

const Dashboard = ({
    recipes,
    mealPlan,
    selectedDate,
    setSelectedDate,
    navigateTo,
    toggleFavorite,
    removeFromMealPlan,
    addToMealPlan,
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b-2 border-dashed border-border">
                <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-1 font-medium font-serif italic">
                        <span>Good morning, Rachana</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif text-foreground leading-tight">
                        <span className="text-muted-foreground font-light">Welcome to</span> Rasoi
                    </h1>
                </div>
                <div className="flex gap-3">
                    <Button onClick={() => navigateTo('generate')} variant="primary" className="rounded-full px-6">
                        <Sparkles className="w-4 h-4 mr-2 text-primary-foreground" /> Generate Recipe
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Calendar / Journal Widget */}
                <div className="lg:col-span-4 flex flex-col gap-6 h-full">
                    <WeeklyCalendar
                        recipes={recipes}
                        mealPlan={mealPlan}
                        selectedDate={selectedDate}
                        onDateSelect={setSelectedDate}
                        onAddRecipe={(date, recipeId) => addToMealPlan(recipeId, date)}
                        onRemoveRecipe={(date, idx) => {
                            const dateKey = date.toDateString();
                            const recipeId = mealPlan[dateKey][idx];
                            removeFromMealPlan(dateKey, recipeId);
                        }}
                        navigateTo={navigateTo}
                        compact={true}
                    />
                </div>

                {/* Widgets Column */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    <RecentlyCooked
                        recipes={recipes}
                        mealPlan={mealPlan}
                        onCookAgain={(id) => addToMealPlan(id, selectedDate)}
                        navigateTo={navigateTo}
                    />

                    <MealPrepSuggestions
                        recipes={recipes}
                        onAddToPlan={(id) => addToMealPlan(id, selectedDate)}
                        navigateTo={navigateTo}
                    />
                </div>

                {/* Favorites */}
                <div className="lg:col-span-12 mt-4">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
                            <Heart className="w-5 h-5 text-destructive fill-destructive" /> Loved Recipes
                        </h3>
                        <Button variant="ghost" onClick={() => navigateTo('recipes')} className="font-serif italic">View All Index <ChevronRight className="w-4 h-4 ml-1" /></Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favoriteRecipes.length > 0 ? favoriteRecipes.slice(0, 3).map(recipe => (
                            <RecipeCard key={recipe.id} recipe={recipe} onClick={() => navigateTo('detail', recipe.id)} onToggleFav={toggleFavorite} />
                        )) : (
                            <div className="col-span-full text-center py-12 bg-muted/50 rounded-xl border-2 border-dashed border-border text-muted-foreground font-serif italic">
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
