'use client';

import React, { useState, useEffect } from 'react';
import RecipesList from '@/components/RecipesList';
import { useRecipes } from '@/context/RecipeContext';
import { useActivityLog } from '@/context/ActivityLogContext';
import { useRouter } from 'next/navigation';

export default function Recipes() {
    const { recipes, mealPlan, loading, toggleFavorite: toggleFavoriteContext, reorderRecipes } = useRecipes();
    const { addActivity } = useActivityLog();
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState('manual');
    const [viewMode, setViewMode] = useState('grid');

    // Filter States
    const [filterMealType, setFilterMealType] = useState('');
    const [filterCuisine, setFilterCuisine] = useState('');
    const [filterDietary, setFilterDietary] = useState('');
    const [filterTime, setFilterTime] = useState('');
    const [filterIngredients, setFilterIngredients] = useState('');
    const [filterFavorites, setFilterFavorites] = useState(false);
    const [filterRecent, setFilterRecent] = useState(false);

    // Load viewMode preference from localStorage on mount
    useEffect(() => {
        const storedViewMode = localStorage.getItem('chefs_notebook_view_mode');
        if (storedViewMode) {
            setViewMode(storedViewMode);
        }
    }, []);

    // Save viewMode preference to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('chefs_notebook_view_mode', viewMode);
    }, [viewMode]);

    const navigateTo = (view, id = null) => {
        if (view === 'detail' && id) {
            router.push(`/recipes/${id}`);
        } else if (view === 'add') {
            router.push('/recipes/add');
        } else if (view === 'edit' && id) {
            router.push(`/recipes/${id}/edit`);
        } else if (view === 'dashboard') {
            router.push('/');
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

    const getFilteredRecipes = () => {
        let filtered = Array.isArray(recipes) ? recipes : [];

        if (searchQuery.trim()) {
            const normalizedQuery = searchQuery.trim().toLowerCase();
            const tokens = normalizedQuery.split(/\s+/).filter(t => t.length > 0);
            filtered = filtered.filter(r => {
                const searchable = [
                    r.title,
                    r.description || '',
                    (r.ingredients || []).join(" "),
                    (r.steps || []).join(" "),
                    (r.tags || []).join(" ")
                ].join(" ").toLowerCase();
                return tokens.every(token => searchable.includes(token));
            });
        }

        if (filterMealType && filterMealType !== 'all') {
            filtered = filtered.filter(r => r.tags && r.tags.some(t => t.toLowerCase() === filterMealType.toLowerCase()));
        }
        if (filterCuisine && filterCuisine !== 'all') {
            filtered = filtered.filter(r => r.tags && r.tags.some(t => t.toLowerCase() === filterCuisine.toLowerCase()));
        }
        if (filterDietary && filterDietary !== 'all') {
            filtered = filtered.filter(r => r.tags && r.tags.some(t => t.toLowerCase() === filterDietary.toLowerCase()));
        }
        if (filterTime && filterTime !== 'all') {
            filtered = filtered.filter(r => {
                const timeStr = r.time || '';
                const minutes = parseInt(timeStr.replace(/\D/g, '')) || 0;
                if (filterTime === '15') return minutes > 0 && minutes <= 15;
                if (filterTime === '30') return minutes > 0 && minutes <= 30;
                if (filterTime === '60') return minutes > 0 && minutes <= 60;
                return true;
            });
        }
        if (filterIngredients && filterIngredients !== 'all') {
            filtered = filtered.filter(r => {
                const count = r.ingredients ? r.ingredients.length : 0;
                if (filterIngredients === '5') return count <= 5;
                if (filterIngredients === '10') return count <= 10;
                return true;
            });
        }
        if (filterFavorites) {
            filtered = filtered.filter(r => r.favorite);
        }
        if (filterRecent) {
            const recentRecipeIds = new Set();
            const today = new Date();
            for (let i = 0; i < 7; i++) {
                const d = new Date(today);
                d.setDate(today.getDate() - i);
                const dateKey = d.toDateString();
                if (mealPlan[dateKey]) {
                    mealPlan[dateKey].forEach(id => recentRecipeIds.add(id));
                }
            }
            filtered = filtered.filter(r => recentRecipeIds.has(r.id));
        }

        if (sortOrder !== 'manual') {
            return filtered.sort((a, b) => {
                if (sortOrder === 'newest') return b.createdAt - a.createdAt;
                if (sortOrder === 'oldest') return a.createdAt - b.createdAt;
                if (sortOrder === 'a-z') return a.title.localeCompare(b.title);
                if (sortOrder === 'z-a') return b.title.localeCompare(a.title);
                return 0;
            });
        }

        return filtered;
    };

    const filteredRecipes = getFilteredRecipes();

    return (
        <RecipesList
            filteredRecipes={filteredRecipes}
            allRecipes={recipes}
            loading={loading}
            navigateTo={navigateTo}
            toggleFavorite={toggleFavorite}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            viewMode={viewMode}
            setViewMode={setViewMode}
            reorderRecipes={reorderRecipes}
            filterMealType={filterMealType}
            setFilterMealType={setFilterMealType}
            filterCuisine={filterCuisine}
            setFilterCuisine={setFilterCuisine}
            filterDietary={filterDietary}
            setFilterDietary={setFilterDietary}
            filterTime={filterTime}
            setFilterTime={setFilterTime}
            filterIngredients={filterIngredients}
            setFilterIngredients={setFilterIngredients}
            filterFavorites={filterFavorites}
            setFilterFavorites={setFilterFavorites}
            filterRecent={filterRecent}
            setFilterRecent={setFilterRecent}
        />
    );
}
