'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import RecipeDetail from '@/components/RecipeDetail';
import { useRecipes } from '@/context/RecipeContext';
import { useActivityLog } from '@/context/ActivityLogContext';
import { useToast } from '@/context/ToastContext';

export default function RecipeDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { recipes, mealPlan, toggleFavorite: toggleFavoriteContext, deleteRecipe, addToMealPlan: addToMealPlanContext } = useRecipes();
    const { addActivity } = useActivityLog();
    const toast = useToast();

    const navigateTo = (view, recipeId) => {
        if (view === 'recipes') {
            router.push('/recipes');
        } else if (view === 'edit') {
            router.push(`/recipes/${id}/edit`);
        } else if (view === 'generate') {
            router.push('/generate');
        }
    };

    const toggleFavorite = (e, recipeId) => {
        e.stopPropagation();
        const recipe = recipes.find(r => r.id === recipeId);
        const isFavorited = recipe?.favorite;
        toggleFavoriteContext(recipeId);

        if (recipe) {
            if (isFavorited) {
                addActivity('recipe_unfavorited', `Unfavorited: ${recipe.title}`);
            } else {
                addActivity('recipe_favorited', `Favorited: ${recipe.title}`);
            }
        }
    };

    const handleDeleteRecipe = (recipeId) => {
        if (confirm('Tear this page out of your notebook?')) {
            const recipe = recipes.find(r => r.id === recipeId);
            deleteRecipe(recipeId);
            toast.success('Recipe removed from notebook');
            if (recipe) {
                addActivity('recipe_deleted', `Removed: ${recipe.title}`);
            }
            router.push('/recipes');
        }
    };

    const addToMealPlan = (recipeId, date) => {
        const recipe = recipes.find(r => r.id === recipeId);
        addToMealPlanContext(recipeId, date);

        if (recipe) {
            const dateStr = new Date(date).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric'
            });
            addActivity('meal_planned', `Planned "${recipe.title}" for ${dateStr}`);
            toast.success(`✓ Added to meal plan for ${dateStr}`);
        }
    };

    const generateVariation = (recipe) => {
        router.push(`/generate?variationOf=${recipe.id}`);
    };

    return (
        <RecipeDetail
            activeRecipeId={id}
            recipes={recipes}
            navigateTo={navigateTo}
            toggleFavorite={toggleFavorite}
            addToMealPlan={addToMealPlan}
            handleDeleteRecipe={handleDeleteRecipe}
            generateVariation={generateVariation}
            selectedDate={new Date()}
            mealPlan={mealPlan}
        />
    );
}
