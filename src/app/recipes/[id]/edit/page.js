'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import RecipeForm from '@/components/RecipeForm';
import { useRecipes } from '@/context/RecipeContext';
import { useActivityLog } from '@/context/ActivityLogContext';
import { useToast } from '@/context/ToastContext';

export default function EditRecipePage() {
    const { id } = useParams();
    const router = useRouter();
    const { recipes, updateRecipe } = useRecipes();
    const { addActivity } = useActivityLog();
    const toast = useToast();

    const recipe = recipes.find(r => r.id === id);

    const handleSaveRecipe = (updatedRecipe) => {
        updateRecipe(updatedRecipe);
        toast.success('✓ Recipe updated successfully!');
        addActivity('recipe_updated', `Updated: ${updatedRecipe.title}`);
        router.push(`/recipes/${id}`);
    };

    const navigateTo = (view) => {
        if (view === 'recipes') {
            router.push('/recipes');
        } else if (view === 'detail') {
            router.push(`/recipes/${id}`);
        }
    };

    if (!recipe) return <div>Recipe not found</div>;

    return (
        <RecipeForm
            initialData={recipe}
            handleSaveRecipe={handleSaveRecipe}
            navigateTo={navigateTo}
        />
    );
}
