'use client';

import React from 'react';
import SettingsView from '@/components/SettingsView';
import { useRecipes } from '@/context/RecipeContext';
import { useTheme } from '@/context/ThemeContext';

export default function Settings() {
    const { recipes, mealPlan, importData } = useRecipes();
    const { darkMode, toggleDarkMode } = useTheme();

    const handleImportData = (jsonString) => {
        const success = importData(jsonString);
        if (success) {
            alert('Notebook restored successfully!');
        } else {
            alert('Error reading the file.');
        }
    };

    return (
        <SettingsView
            recipes={recipes}
            mealPlan={mealPlan}
            handleImportData={handleImportData}
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
        />
    );
}
