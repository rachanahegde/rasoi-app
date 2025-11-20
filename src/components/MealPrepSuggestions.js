import React, { useMemo } from 'react';
import { Sparkles, Clock, Plus, ChefHat, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const MealPrepSuggestions = ({ recipes, onAddToPlan, navigateTo }) => {
    const suggestions = useMemo(() => {
        // Filter for recipes that might be good for meal prep
        // For now, let's pick random ones or ones with specific tags if available
        // Or just recipes with longer prep time (implies batch?) or just random for variety

        // Let's simulate "smart" suggestions by shuffling and picking 4
        const shuffled = [...recipes].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 4);
    }, [recipes]);

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Utensils className="w-5 h-5 text-green-900" />
                <h3 className="font-serif font-bold text-xl text-stone-800">Meal Prep Ideas</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {suggestions.map(recipe => (
                    <div key={recipe.id} className="bg-[#FDFCF8] p-3 rounded-xl border border-stone-200 shadow-sm hover:shadow-md hover:border-green-800 transition-all flex gap-4 group cursor-pointer" onClick={() => navigateTo('detail', recipe.id)}>
                        <div className="w-24 h-24 rounded-lg bg-stone-100 shrink-0 overflow-hidden relative border border-stone-100">
                            {recipe.image ? (
                                <img
                                    src={recipe.image}
                                    alt={recipe.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 sepia-[.2]"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-300 bg-stone-100">
                                    <ChefHat className="w-8 h-8" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                            <div>
                                <h4 className="font-serif font-bold text-stone-800 truncate group-hover:text-[#6f1d1b] transition-colors">
                                    {recipe.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <span className="text-xs text-stone-500 flex items-center gap-1 bg-stone-100 px-1.5 py-0.5 rounded-md font-serif">
                                        <Clock className="w-3 h-3" /> {recipe.prepTime || '45m'}
                                    </span>
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-[#6f1d1b]/10 text-[#6f1d1b] border-[#6f1d1b]/20 font-serif">
                                        Batch-friendly
                                    </Badge>
                                </div>
                            </div>

                            <div className="mt-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-3 text-xs font-medium text-stone-600 hover:text-[#6f1d1b] hover:bg-[#6f1d1b]/5 -ml-2 w-fit font-serif"
                                    onClick={(e) => { e.stopPropagation(); onAddToPlan(recipe.id); }}
                                >
                                    <Plus className="w-3.5 h-3.5 mr-1.5" /> Add to Plan
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MealPrepSuggestions;
