import React, { useState } from 'react';
import { Search, LayoutGrid, List, Plus, Heart, Clock, Flame, GripVertical, Filter, X, ChefHat, Utensils, Leaf, Timer, ShoppingBasket, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import RecipeCard from '@/components/RecipeCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const RecipesList = ({
    filteredRecipes,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    navigateTo,
    toggleFavorite,
    reorderRecipes,
    allRecipes,
    // Filter props
    filterMealType, setFilterMealType,
    filterCuisine, setFilterCuisine,
    filterDietary, setFilterDietary,
    filterTime, setFilterTime,
    filterIngredients, setFilterIngredients,
    filterFavorites, setFilterFavorites,
    filterRecent, setFilterRecent,
    loading
}) => {
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    const hasActiveFilters = filterMealType || filterCuisine || filterDietary || filterTime || filterIngredients || filterFavorites || filterRecent;
    const canReorder = !hasActiveFilters && !searchQuery;

    const handleDragStart = (e, index) => {
        if (!canReorder) return;
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverIndex(index);
    };

    const handleDrop = (e, dropIndex) => {
        e.preventDefault();
        
        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }

        // Get the actual recipe IDs being reordered
        const draggedRecipe = filteredRecipes[draggedIndex];
        const targetRecipe = filteredRecipes[dropIndex];

        // Find their positions in the full recipes array
        const fullRecipesCopy = [...allRecipes];
        const draggedFullIndex = fullRecipesCopy.findIndex(r => r.id === draggedRecipe.id);
        const targetFullIndex = fullRecipesCopy.findIndex(r => r.id === targetRecipe.id);

        // Reorder in the full array
        const [removed] = fullRecipesCopy.splice(draggedFullIndex, 1);
        fullRecipesCopy.splice(targetFullIndex, 0, removed);

        // Save the new order
        reorderRecipes(fullRecipesCopy);

        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const clearAllFilters = () => {
        setFilterMealType('');
        setFilterCuisine('');
        setFilterDietary('');
        setFilterTime('');
        setFilterIngredients('');
        setFilterFavorites(false);
        setFilterRecent(false);
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="flex flex-col gap-4 border-b border-border pb-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
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

                        <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => setShowFilters(!showFilters)}
                            className={`rounded-lg border-border ${showFilters || hasActiveFilters ? 'bg-primary/10 text-primary border-primary/30' : ''}`}
                        >
                            <Filter className="w-4 h-4" />
                        </Button>

                        <Button onClick={() => navigateTo('add')} variant="primary" className="rounded-lg">
                            <Plus className="w-4 h-4 mr-2" /> Write New
                        </Button>
                    </div>
                </div>

                {/* Filter Bar */}
                {showFilters && (
                    <div className="bg-card border border-border rounded-xl p-4 shadow-sm animate-in slide-in-from-top-2 duration-200">
                        <div className="flex flex-wrap gap-4 items-center">
                            <div className="flex items-center gap-2 min-w-[140px]">
                                <Utensils className="w-4 h-4 text-muted-foreground" />
                                <Select value={filterMealType} onValueChange={setFilterMealType}>
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="Meal Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Meals</SelectItem>
                                        <SelectItem value="Breakfast">Breakfast</SelectItem>
                                        <SelectItem value="Lunch">Lunch</SelectItem>
                                        <SelectItem value="Dinner">Dinner</SelectItem>
                                        <SelectItem value="Snack">Snack</SelectItem>
                                        <SelectItem value="Dessert">Dessert</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2 min-w-[140px]">
                                <ChefHat className="w-4 h-4 text-muted-foreground" />
                                <Select value={filterCuisine} onValueChange={setFilterCuisine}>
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="Cuisine" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Cuisines</SelectItem>
                                        <SelectItem value="Indian">Indian</SelectItem>
                                        <SelectItem value="Italian">Italian</SelectItem>
                                        <SelectItem value="Mexican">Mexican</SelectItem>
                                        <SelectItem value="Asian">Asian</SelectItem>
                                        <SelectItem value="American">American</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2 min-w-[140px]">
                                <Leaf className="w-4 h-4 text-muted-foreground" />
                                <Select value={filterDietary} onValueChange={setFilterDietary}>
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="Dietary" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Diets</SelectItem>
                                        <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                                        <SelectItem value="Vegan">Vegan</SelectItem>
                                        <SelectItem value="Gluten-Free">Gluten-Free</SelectItem>
                                        <SelectItem value="Healthy">Healthy</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2 min-w-[140px]">
                                <Timer className="w-4 h-4 text-muted-foreground" />
                                <Select value={filterTime} onValueChange={setFilterTime}>
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="Time" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Any Time</SelectItem>
                                        <SelectItem value="15">Under 15 mins</SelectItem>
                                        <SelectItem value="30">Under 30 mins</SelectItem>
                                        <SelectItem value="60">Under 1 hour</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2 min-w-[140px]">
                                <ShoppingBasket className="w-4 h-4 text-muted-foreground" />
                                <Select value={filterIngredients} onValueChange={setFilterIngredients}>
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="Ingredients" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Any Count</SelectItem>
                                        <SelectItem value="5">5 or less</SelectItem>
                                        <SelectItem value="10">10 or less</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="h-8 w-px bg-border mx-2 hidden md:block" />

                            <Button
                                variant={filterFavorites ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setFilterFavorites(!filterFavorites)}
                                className={`text-xs ${filterFavorites ? 'bg-red-100 text-red-600 hover:bg-red-200' : ''}`}
                            >
                                <Heart className={`w-3.5 h-3.5 mr-1.5 ${filterFavorites ? 'fill-current' : ''}`} />
                                Favorites
                            </Button>

                            <Button
                                variant={filterRecent ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setFilterRecent(!filterRecent)}
                                className={`text-xs ${filterRecent ? 'bg-primary/10 text-primary' : ''}`}
                            >
                                <Clock className="w-3.5 h-3.5 mr-1.5" />
                                Cooked Recently
                            </Button>

                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearAllFilters}
                                    className="text-xs text-muted-foreground hover:text-foreground ml-auto"
                                >
                                    <X className="w-3.5 h-3.5 mr-1.5" />
                                    Clear All
                                </Button>
                            )}
                        </div>
                        <div className="w-full text-xs text-muted-foreground italic border-t border-border pt-2 mt-2">
                            Note: Filters work best with tagged recipes. Add tags like "Dinner" or "Italian" to your recipes to make them searchable.
                        </div>
                    </div>
                )}
            </div>

            {/* Note about reordering */}
            {canReorder && viewMode === 'list' && (
                <div className="text-xs text-muted-foreground italic text-center -mt-2">
                    Tip: You can drag and drop recipes to reorder them in this list.
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <Loader className="w-8 h-8 animate-spin mb-4" />
                    <p className="font-serif italic">Loading your notebook...</p>
                </div>
            ) : filteredRecipes && filteredRecipes.length > 0 ? (
                <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
                    {filteredRecipes.map((recipe, index) => (
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
                                draggable={canReorder}
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDrop={(e) => handleDrop(e, index)}
                                onDragEnd={handleDragEnd}
                                className={`
                                    group flex items-center gap-4 p-4 bg-card rounded-xl border border-border 
                                    hover:border-input shadow-sm hover:shadow-md transition-all 
                                    ${canReorder ? 'cursor-move' : ''}
                                    ${draggedIndex === index ? 'opacity-50' : ''}
                                    ${dragOverIndex === index && draggedIndex !== index ? 'border-primary border-2 scale-[1.02]' : ''}
                                `}
                            >
                                {/* Drag Handle */}
                                {canReorder && (
                                    <div className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                                        <GripVertical className="w-5 h-5" />
                                    </div>
                                )}

                                <img 
                                    src={recipe.image} 
                                    className="w-20 h-20 rounded-lg object-cover sepia-[.15]" 
                                    alt="thumb"
                                    onClick={() => navigateTo('detail', recipe.id)}
                                />
                                <div className="flex-1" onClick={() => navigateTo('detail', recipe.id)}>
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-serif font-bold text-lg text-foreground">{recipe.title}</h3>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFavorite(recipe.id);
                                            }}
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
};

export default RecipesList;
