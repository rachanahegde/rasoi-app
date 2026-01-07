'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import RecipeForm from '@/components/RecipeForm';
import { useRecipes } from '@/context/RecipeContext';
import { useActivityLog } from '@/context/ActivityLogContext';
import { useToast } from '@/context/ToastContext';

export default function AddRecipePage() {
    const router = useRouter();
    const { addRecipe } = useRecipes();
    const { addActivity } = useActivityLog();
    const toast = useToast();

    const handleSaveRecipe = (recipe) => {
        addRecipe(recipe);
        toast.success('✓ Recipe saved to your notebook!');
        addActivity('recipe_added', `Added a new recipe: ${recipe.title}`, null, recipe.tags);
        router.push('/recipes');
    };

    const navigateTo = (view) => {
        if (view === 'recipes') {
            router.push('/recipes');
        }
    };

    return (
        <RecipeForm
            handleSaveRecipe={handleSaveRecipe}
            navigateTo={navigateTo}
        />
    );
}
