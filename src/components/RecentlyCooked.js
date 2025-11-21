import React, { useMemo } from 'react';
import { Clock, History, ChefHat, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RecentlyCooked = ({ recipes, mealPlan, onCookAgain, navigateTo }) => {
    const recentMeals = useMemo(() => {
        const history = [];
        const today = new Date();

        // Iterate through meal plan to find past meals
        Object.entries(mealPlan).forEach(([dateStr, recipeIds]) => {
            const date = new Date(dateStr);
            if (date < today) {
                recipeIds.forEach(id => {
                    const recipe = recipes.find(r => r.id === id);
                    if (recipe) {
                        // Check if already in history (deduplicate, keep most recent)
                        const existingIndex = history.findIndex(h => h.recipe.id === id);
                        if (existingIndex >= 0) {
                            if (date > history[existingIndex].date) {
                                history[existingIndex].date = date;
                            }
                        } else {
                            history.push({ recipe, date });
                        }
                    }
                });
            }
        });

        // Sort by date descending and take top 5
        return history.sort((a, b) => b.date - a.date).slice(0, 5);
    }, [recipes, mealPlan]);

    // Temporary demo data for visualization
    const demoMeals = useMemo(() => {
        return recipes.slice(0, 4).map((recipe, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (i + 1) * 2);
            return { recipe, date: d };
        });
    }, [recipes]);

    // Use demo data if no real history exists (for now, as requested)
    const displayMeals = recentMeals.length > 0 ? recentMeals : demoMeals;

    if (displayMeals.length === 0) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <History className="w-5 h-5 text-primary" />
                    <h3 className="font-serif font-bold text-xl text-foreground">Recently Cooked</h3>
                </div>
                <div className="bg-card border-2 border-dashed border-border rounded-xl p-8 text-center shadow-sm">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-primary/20">
                        <ChefHat className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="font-serif font-bold text-foreground mb-1">Start Your Culinary Journey</h4>
                    <p className="text-muted-foreground text-sm mb-4 max-w-xs mx-auto font-serif">
                        Your cooking history will appear here. Mark meals as cooked or add them to past dates to build your log!
                    </p>
                    <Button variant="outline" onClick={() => navigateTo('recipes')} className="text-primary border-primary/20 hover:bg-primary/5 hover:text-primary font-serif">
                        Browse Recipes
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-primary" />
                    <h3 className="font-serif font-bold text-xl text-foreground">Recently Cooked</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {displayMeals.map(({ recipe, date }) => (
                    <div key={recipe.id} className="group bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:border-primary transition-all overflow-hidden flex flex-col">
                        <div className="relative h-32 bg-muted overflow-hidden cursor-pointer" onClick={() => navigateTo('detail', recipe.id)}>
                            {recipe.image ? (
                                <img
                                    src={recipe.image}
                                    alt={recipe.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 sepia-[.15]"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-muted">
                                    <ChefHat className="w-8 h-8" />
                                </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
                                <span className="text-[10px] text-white font-medium flex items-center gap-1.5 backdrop-blur-sm bg-black/30 w-fit px-2 py-0.5 rounded-full border border-white/20">
                                    <Clock className="w-3 h-3" /> {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                        </div>

                        <div className="p-3 flex flex-col flex-1">
                            <h4 className="font-serif font-bold text-foreground text-sm mb-1 truncate cursor-pointer hover:text-primary transition-colors" onClick={() => navigateTo('detail', recipe.id)}>
                                {recipe.title}
                            </h4>
                            <div className="mt-auto pt-3">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="w-full text-xs h-8 bg-muted text-foreground hover:bg-primary/5 hover:text-primary hover:border-primary/20 border border-border font-serif transition-colors"
                                    onClick={() => onCookAgain(recipe.id)}
                                >
                                    Cook Again
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentlyCooked;
