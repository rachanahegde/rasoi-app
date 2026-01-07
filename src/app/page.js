'use client';

import React, { useState } from 'react';
import Dashboard from '@/components/Dashboard';
import { useRecipes } from '@/context/RecipeContext';
import { useActivityLog } from '@/context/ActivityLogContext';
import { useRouter } from 'next/navigation';

export default function Home() {
  const {
    recipes,
    mealPlan,
    addToMealPlan: addToMealPlanContext,
    removeFromMealPlan: removeFromMealPlanContext,
    toggleFavorite: toggleFavoriteContext,
  } = useRecipes();

  const { addActivity } = useActivityLog();
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  const navigateTo = (view, id = null) => {
    if (view === 'recipes') {
      router.push('/recipes');
    } else if (view === 'detail' && id) {
      router.push(`/recipes/${id}`);
    } else if (view === 'generate') {
      router.push('/generate');
    } else if (view === 'calendar') {
      router.push('/calendar');
    } else if (view === 'activity') {
      router.push('/activity');
    } else if (view === 'settings') {
      router.push('/settings');
    } else if (view === 'profile') {
      router.push('/profile');
    }
  };

  const toggleFavorite = (e, id) => {
    e.stopPropagation();
    const recipe = recipes.find(r => r.id === id);
    const isFavorited = recipe?.favorite;
    toggleFavoriteContext(id);

    if (recipe) {
      if (isFavorited) {
        addActivity('recipe_unfavorited', `Unfavorited: ${recipe.title}`);
      } else {
        addActivity('recipe_favorited', `Favorited: ${recipe.title}`);
      }
    }
  };

  const addToMealPlan = (recipeId, date = null) => {
    const targetDate = date || selectedDate;
    const recipe = recipes.find(r => r.id === recipeId);
    addToMealPlanContext(recipeId, targetDate);

    if (recipe) {
      const dateStr = new Date(targetDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
      });
      addActivity('meal_planned', `Planned "${recipe.title}" for ${dateStr}`);
    }
  };

  const removeFromMealPlan = (dateKey, indexToRemove) => {
    const recipesForDay = mealPlan[dateKey] || [];
    const recipeId = recipesForDay[indexToRemove];
    const recipe = recipes.find(r => r.id === recipeId);

    removeFromMealPlanContext(dateKey, indexToRemove);

    if (recipe) {
      const date = new Date(dateKey);
      const dateStr = date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
      });
      addActivity('meal_removed', `Removed "${recipe.title}" from ${dateStr}`);
    }
  };

  return (
    <Dashboard
      recipes={recipes}
      mealPlan={mealPlan}
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
      navigateTo={navigateTo}
      toggleFavorite={toggleFavorite}
      removeFromMealPlan={removeFromMealPlan}
      addToMealPlan={addToMealPlan}
      setSearchQuery={setSearchQuery}
    />
  );
}