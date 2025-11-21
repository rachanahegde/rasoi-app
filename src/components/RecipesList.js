import React from 'react';
import { Search, LayoutGrid, List, Plus, Heart, Clock, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import RecipeCard from '@/components/RecipeCard';

const RecipesList = ({
    filteredRecipes,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    navigateTo,
    toggleFavorite
}) => (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-border pb-6">
            <h2 className="text-3xl font-serif font-bold text-foreground">Recipe Index</h2>
            <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
                {/* Search Bar - Logbook style */}
                <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Find in notebook..."
                        className="pl-10 bg-card rounded-lg border-border shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* View Toggle */}
                <div className="flex bg-card border border-border rounded-lg p-1 h-11 items-center shadow-sm">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>

                <Button onClick={() => navigateTo('add')} variant="primary" className="rounded-lg">
                    <Plus className="w-4 h-4 mr-2" /> Write New
                </Button>
            </div>
        </div>

        {filteredRecipes.length > 0 ? (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
                {filteredRecipes.map(recipe => (
                    viewMode === 'grid' ? (
                        <RecipeCard
                            key={recipe.id}
                            recipe={recipe}
                            onClick={() => navigateTo('detail', recipe.id)}
                            onToggleFav={toggleFavorite}
                        />
                    ) : (
                        <div
                            key={recipe.id}
                            onClick={() => navigateTo('detail', recipe.id)}
                            className="group flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-input shadow-sm hover:shadow-md transition-all cursor-pointer"
                        >
                            <img src={recipe.image} className="w-20 h-20 rounded-lg object-cover sepia-[.15]" alt="thumb" />
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-serif font-bold text-lg text-foreground">{recipe.title}</h3>
                                    <button
                                        onClick={(e) => toggleFavorite(e, recipe.id)}
                                        className={`p-2 hover:bg-muted rounded-full ${recipe.favorite ? 'text-destructive' : 'text-muted'}`}
                                    >
                                        <Heart className={`w-5 h-5 ${recipe.favorite ? 'fill-current' : ''}`} />
                                    </button>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-1 mb-2 font-serif italic">{recipe.description}</p>
                                <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {recipe.time}</span>
                                    <span className="flex items-center gap-1"><Flame className="w-3 h-3" /> {recipe.calories || 'N/A'}</span>
                                    <Badge className="bg-muted text-muted-foreground border-none">{recipe.difficulty}</Badge>
                                </div>
                            </div>
                        </div>
                    )
                ))}
            </div>
        ) : (
            <div className="text-center py-20">
                <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-border">
                    <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-serif text-foreground">Page empty</h3>
                <p className="text-muted-foreground font-serif italic">No recipes found matching that description.</p>
            </div>
        )}
    </div>
);

export default RecipesList;
