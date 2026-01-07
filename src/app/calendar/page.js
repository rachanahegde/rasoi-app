'use client';

import React from 'react';
import CalendarPage from '@/components/CalendarPage';
import { useRecipes } from '@/context/RecipeContext';
import { useRouter } from 'next/navigation';

export default function Calendar() {
    const { recipes, mealPlan, setMealPlan, groceryState, setGroceryState } = useRecipes();
    const router = useRouter();

    const navigateTo = (view, id) => {
        if (view === 'detail' && id) {
            router.push(`/recipes/${id}`);
        } else if (view === 'recipes') {
            router.push('/recipes');
        } else if (view === 'dashboard') {
            router.push('/');
        }
    };

    return (
        <CalendarPage
            recipes={recipes}
            mealPlan={mealPlan}
            setMealPlan={setMealPlan}
            groceryState={groceryState}
            setGroceryState={setGroceryState}
            navigateTo={navigateTo}
        />
    );
}
