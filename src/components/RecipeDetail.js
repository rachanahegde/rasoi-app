import React from 'react';
import { ArrowLeft, Heart, Clock, Flame, ChefHat, CalendarDays, Plus, Edit, Trash2, Sparkles, Utensils, Check, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const RecipeDetail = ({
    activeRecipeId,
    recipes,
    navigateTo,
    toggleFavorite,
    addToMealPlan,
    handleDeleteRecipe,
    generateVariation,
    selectedDate
}) => {
    const recipe = recipes.find(r => r.id === activeRecipeId);
    if (!recipe) return <div>Not found</div>;

    return (
        <div className="max-w-4xl mx-auto animate-in zoom-in-95 duration-300 pb-20">
            <Button variant="ghost" onClick={() => navigateTo('recipes')} className="mb-4 pl-0 hover:bg-transparent hover:text-primary font-serif italic">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Index
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Left: Visuals */}
                <div className="space-y-6">
                    <div className="relative aspect-[4/5] rounded-sm p-2 bg-card shadow-md border border-border -rotate-1">
                        {/* Photo frame look */}
                        <div className="h-full w-full overflow-hidden bg-muted relative">
                            <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover sepia-[.1]" />
                            <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] pointer-events-none"></div>
                        </div>
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 bg-muted/50 rotate-1 backdrop-blur-sm border border-border/50 flex items-center justify-center shadow-sm">
                            <div className="w-2 h-2 rounded-full bg-muted-foreground mr-2"></div>
                            <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                        </div>
                        <button
                            onClick={(e) => toggleFavorite(e, recipe.id)}
                            className="absolute bottom-6 right-6 bg-card p-3 rounded-full shadow-md hover:scale-110 transition-transform border border-muted"
                        >
                            <Heart className={`w-6 h-6 ${recipe.favorite ? 'fill-destructive text-destructive' : 'text-muted'}`} />
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 text-center border-r border-border">
                            <Clock className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                            <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Time</div>
                            <div className="font-serif font-bold text-foreground">{recipe.time}</div>
                        </div>
                        <div className="p-3 text-center border-r border-border">
                            <Flame className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                            <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Cals</div>
                            <div className="font-serif font-bold text-foreground">{recipe.calories || '-'}</div>
                        </div>
                        <div className="p-3 text-center">
                            <ChefHat className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                            <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Level</div>
                            <div className="font-serif font-bold text-foreground">{recipe.difficulty}</div>
                        </div>
                    </div>

                    <div
                        onClick={() => addToMealPlan(recipe.id)}
                        className="p-4 bg-primary text-primary-foreground rounded-lg flex items-center justify-between cursor-pointer hover:bg-primary/90 transition-colors shadow-md border-2 border-primary"
                    >
                        <div className="flex items-center gap-3">
                            <CalendarDays className="w-5 h-5 text-primary-foreground" />
                            <div className="text-sm">
                                <div className="font-bold font-serif">Schedule this meal</div>
                                <div className="text-primary-foreground/80 text-xs italic">For {selectedDate.toLocaleDateString()}</div>
                            </div>
                        </div>
                        <Plus className="w-5 h-5" />
                    </div>
                </div>

                {/* Right: Journal Entry */}
                <div className="space-y-8 relative">
                    {/* Paper texture background for text area */}
                    <div className="absolute inset-0 bg-card border-l-2 border-dashed border-border -z-10 translate-x-4"></div>

                    <div className="pl-6">
                        <div className="flex justify-between items-start mb-4">
                            <h1 className="text-4xl font-serif font-bold text-foreground mb-2 underline decoration-accent decoration-4 underline-offset-4">{recipe.title}</h1>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => navigateTo('edit', recipe.id)}>
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteRecipe(recipe.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        <p className="text-muted-foreground font-serif italic leading-relaxed mb-4 text-lg">"{recipe.description}"</p>
                        <div className="flex gap-2 flex-wrap">
                            {recipe.tags && recipe.tags.map(tag => (
                                <Badge key={tag} className="bg-accent text-accent-foreground border border-accent transform rotate-1">{tag}</Badge>
                            ))}
                        </div>

                        <Button
                            variant="outline"
                            className="mt-8 w-full border-dashed border-border text-muted-foreground hover:text-foreground hover:border-input group font-serif"
                            onClick={() => generateVariation(recipe)}
                        >
                            <Sparkles className="w-4 h-4 mr-2 text-accent group-hover:scale-125 transition-transform" /> Brainstorm variations
                        </Button>
                    </div>

                    <div className="pl-6 pt-4">
                        <h3 className="text-xl font-serif font-bold mb-4 flex items-center gap-2 text-foreground border-b border-border pb-2">
                            <Utensils className="w-5 h-5 text-muted-foreground" /> Shopping List
                        </h3>
                        <ul className="space-y-3">
                            {recipe.ingredients && recipe.ingredients.map((ing, i) => (
                                <li key={i} className="flex items-center gap-3 text-foreground group font-serif text-lg">
                                    <div className="w-5 h-5 border-2 border-border rounded-sm group-hover:border-foreground flex items-center justify-center transition-colors cursor-pointer bg-card">
                                        <Check className="w-4 h-4 text-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <span className="handwritten-underline pb-1 decoration-border decoration-dotted">{ing}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="pl-6 pt-4">
                        <h3 className="text-xl font-serif font-bold mb-4 flex items-center gap-2 text-foreground border-b border-border pb-2">
                            <BookOpen className="w-5 h-5 text-muted-foreground" /> Method
                        </h3>
                        <div className="space-y-6 relative border-l-2 border-border ml-3 pl-6">
                            {recipe.steps && recipe.steps.map((step, i) => (
                                <div key={i} className="relative">
                                    <div className="absolute -left-[33px] top-0 w-6 h-6 rounded-full bg-muted text-muted-foreground border border-border flex items-center justify-center font-serif font-bold text-sm shadow-sm">
                                        {i + 1}
                                    </div>
                                    <p className="text-foreground leading-relaxed font-serif text-lg">{step}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecipeDetail;
