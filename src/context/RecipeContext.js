'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateId } from '@/lib/helpers';

const RecipeContext = createContext();

export function RecipeProvider({ children }) {
    const [recipes, setRecipes] = useState([]);
    const [mealPlan, setMealPlan] = useState({});
    const [groceryState, setGroceryState] = useState({});
    const [loading, setLoading] = useState(true);

    // Load data from local storage
    useEffect(() => {
        const storedRecipes = localStorage.getItem('chefs_notebook_recipes');
        const storedPlan = localStorage.getItem('chefs_notebook_mealplan');
        const storedGroceryState = localStorage.getItem('chefs_notebook_grocery_state');

        if (storedRecipes) {
            try {
                setRecipes(JSON.parse(storedRecipes));
            } catch (e) {
                console.error("Failed to parse recipes", e);
                setRecipes([]);
            }
        } else {
            setRecipes([]);
        }

        if (storedPlan) {
            try {
                setMealPlan(JSON.parse(storedPlan));
            } catch (e) {
                console.error("Failed to parse meal plan", e);
                setMealPlan({});
            }
        }

        if (storedGroceryState) {
            try {
                setGroceryState(JSON.parse(storedGroceryState));
            } catch (e) {
                console.error("Failed to parse grocery state", e);
                setGroceryState({});
            }
        }

        setLoading(false);
    }, []);

    // Save data to local storage
    useEffect(() => {
        if (!loading) {
            localStorage.setItem('chefs_notebook_recipes', JSON.stringify(recipes));
        }
    }, [recipes, loading]);

    useEffect(() => {
        if (!loading) {
            localStorage.setItem('chefs_notebook_mealplan', JSON.stringify(mealPlan));
        }
    }, [mealPlan, loading]);

    useEffect(() => {
        if (!loading) {
            localStorage.setItem('chefs_notebook_grocery_state', JSON.stringify(groceryState));
        }
    }, [groceryState, loading]);

    // Actions
    const addRecipe = (recipe) => {
        const newRecipe = { ...recipe, id: generateId(), favorite: false, createdAt: Date.now() };
        setRecipes(prev => [newRecipe, ...prev]);
    };

    const updateRecipe = (recipe) => {
        setRecipes(prev => prev.map(r => r.id === recipe.id ? { ...recipe, createdAt: r.createdAt } : r));
    };

    const deleteRecipe = (id) => {
        setRecipes(prev => prev.filter(r => r.id !== id));
        // Also remove from meal plan
        const newPlan = { ...mealPlan };
        Object.keys(newPlan).forEach(date => {
            newPlan[date] = newPlan[date].filter(rId => rId !== id);
        });
        setMealPlan(newPlan);
    };

    const toggleFavorite = (id) => {
        setRecipes(prev => prev.map(r => r.id === id ? { ...r, favorite: !r.favorite } : r));
    };

    const addToMealPlan = (recipeId, date) => {
        const dateKey = date.toDateString();
        setMealPlan(prev => ({
            ...prev,
            [dateKey]: prev[dateKey] ? [...prev[dateKey], recipeId] : [recipeId]
        }));
    };

    const removeFromMealPlan = (dateKey, recipeId) => {
        setMealPlan(prev => ({
            ...prev,
            [dateKey]: prev[dateKey].filter(id => id !== recipeId)
        }));
    };

    const importData = (jsonString) => {
        try {
            const data = JSON.parse(jsonString);
            if (data.recipes && Array.isArray(data.recipes)) {
                setRecipes(data.recipes);
                setMealPlan(data.mealPlan || {});
                return true;
            }
        } catch (e) {
            return false;
        }
        return false;
    };

    return (
        <RecipeContext.Provider value={{
            recipes,
            mealPlan,
            groceryState,
            loading,
            setRecipes,
            setMealPlan,
            setGroceryState,
            addRecipe,
            updateRecipe,
            deleteRecipe,
            toggleFavorite,
            addToMealPlan,
            removeFromMealPlan,
            importData
        }}>
            {children}
        </RecipeContext.Provider>
    );
}

export function useRecipes() {
    return useContext(RecipeContext);
}
