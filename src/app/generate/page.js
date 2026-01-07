'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import GeneratorPage from '@/components/GeneratorPage';
import { useRecipes } from '@/context/RecipeContext';
import { useActivityLog } from '@/context/ActivityLogContext';
import { useToast } from '@/context/ToastContext';

function GeneratorContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { recipes, addRecipe } = useRecipes();
    const { addActivity } = useActivityLog();
    const toast = useToast();

    const [aiPrompt, setAiPrompt] = useState('');
    const [aiIngredients, setAiIngredients] = useState('');
    const [autoStart, setAutoStart] = useState(false);

    useEffect(() => {
        const variationOfId = searchParams.get('variationOf');
        if (variationOfId) {
            const recipe = recipes.find(r => r.id === variationOfId);
            if (recipe) {
                setAiPrompt(`A creative variation of my ${recipe.title} recipe.`);
                setAiIngredients(recipe.ingredients.join(", "));
                setAutoStart(true);
            }
        }
    }, [searchParams, recipes]);

    const handleSaveRecipe = (recipe) => {
        addRecipe(recipe);
        toast.success('✓ Recipe saved to your notebook!');
        addActivity('recipe_added', `Added a new recipe: ${recipe.title}`, null, recipe.tags);
        router.push('/recipes');
    };

    return (
        <GeneratorPage
            aiPrompt={aiPrompt}
            setAiPrompt={setAiPrompt}
            aiIngredients={aiIngredients}
            setAiIngredients={setAiIngredients}
            handleSaveRecipe={handleSaveRecipe}
            autoStart={autoStart}
            setAutoStart={setAutoStart}
        />
    );
}

export default function GeneratePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <GeneratorContent />
        </Suspense>
    );
}
