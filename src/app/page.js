'use client';

import React, { useState, useEffect } from 'react';
import {
  Home,
  BookOpen,
  Sparkles,
  Settings,
  Bell,
  Heart,
  Calendar as CalendarIcon,
  PenTool,
  Moon
} from 'lucide-react';

import DottedBackground from '@/components/DottedBackground';
import NavItem from '@/components/NavItem';
import Dashboard from '@/components/Dashboard';
import RecipesList from '@/components/RecipesList';
import RecipeDetail from '@/components/RecipeDetail';
import RecipeForm from '@/components/RecipeForm';
import GeneratorPage from '@/components/GeneratorPage';
import SettingsView from '@/components/SettingsView';
import CalendarPage from '@/components/CalendarPage';

import { generateId } from '@/lib/helpers';
import { useRecipes } from '@/context/RecipeContext';
import { ToastProvider, useToast } from '@/context/ToastContext';
import ToastContainer from '@/components/ToastContainer';

function AppContent() {
  const {
    recipes,
    mealPlan,
    groceryState,
    loading,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    toggleFavorite: toggleFavoriteContext,
    addToMealPlan: addToMealPlanContext,
    removeFromMealPlan: removeFromMealPlanContext,
    setGroceryState,
    setMealPlan,
    importData
  } = useRecipes();

  const toast = useToast();

  const [view, setView] = useState('dashboard');
  const [activeRecipeId, setActiveRecipeId] = useState(null);
  // recipes, mealPlan, loading, groceryState moved to context
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiIngredients, setAiIngredients] = useState('');
  // groceryState moved to context
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check system preference on initial load if no preference stored
    const storedDarkMode = localStorage.getItem('chefs_notebook_dark_mode');
    if (storedDarkMode !== null) {
      setDarkMode(storedDarkMode === 'true');
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  // Dark mode effect remains here as it is UI state
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('chefs_notebook_dark_mode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Data persistence effects removed (handled in context)

  const handleSaveRecipe = (recipe) => {
    if (recipe.id) {
      updateRecipe(recipe);
      toast.success('✓ Recipe updated successfully!');
    } else {
      addRecipe(recipe);
      toast.success('✓ Recipe saved to your notebook!');
    }
    setView('recipes');
  };

  const handleDeleteRecipe = (id) => {
    if (confirm('Tear this page out of your notebook?')) {
      deleteRecipe(id);
      toast.success('Recipe removed from notebook');
      setView('recipes');
    }
  };

  const toggleFavorite = (e, id) => {
    e.stopPropagation();
    toggleFavoriteContext(id);
  };

  const addToMealPlan = (recipeId, date = null) => {
    const targetDate = date || selectedDate;
    addToMealPlanContext(recipeId, targetDate);
  };

  const removeFromMealPlan = (dateKey, recipeId) => {
    removeFromMealPlanContext(dateKey, recipeId);
  };

  const handleImportData = (jsonString) => {
    const success = importData(jsonString);
    if (success) {
      alert('Notebook restored successfully!');
    } else {
      alert('Error reading the file.');
    }
  };

  const navigateTo = (newView, id = null) => {
    setView(newView);
    if (id) setActiveRecipeId(id);
    window.scrollTo(0, 0);
  };

  const generateVariation = (recipe) => {
    setAiPrompt(`Variation of: ${recipe.title}`);
    setAiIngredients(recipe.ingredients.join(", "));
    navigateTo('generate');
  };

  const getFilteredRecipes = () => {
    let filtered = recipes;
    if (searchQuery.trim()) {
      const normalizedQuery = searchQuery.trim().toLowerCase();
      const tokens = normalizedQuery.split(/\s+/).filter(t => t.length > 0);
      filtered = filtered.filter(r => {
        const searchable = [
          r.title,
          r.description || '',
          r.ingredients.join(" "),
          r.steps.join(" "),
          r.tags.join(" ")
        ].join(" ").toLowerCase();
        return tokens.every(token => searchable.includes(token));
      });
    }
    return filtered.sort((a, b) => {
      if (sortOrder === 'newest') return b.createdAt - a.createdAt;
      if (sortOrder === 'oldest') return a.createdAt - b.createdAt;
      if (sortOrder === 'a-z') return a.title.localeCompare(b.title);
      if (sortOrder === 'z-a') return b.title.localeCompare(a.title);
      return 0;
    });
  };

  const filteredRecipes = getFilteredRecipes();

  return (
      <div className="flex min-h-screen bg-dot-pattern text-foreground font-sans selection:bg-primary/20 selection:text-primary">
        <DottedBackground />
        <ToastContainer />

        {/* SIDEBAR - Leather Binding Look */}
        <aside className="hidden md:flex w-24 flex-col items-center py-8 bg-sidebar border-r border-sidebar-border fixed h-full z-50 shadow-[4px_0_15px_-3px_rgba(0,0,0,0.1)]">
          <nav className="flex-1 flex flex-col gap-6 w-full px-4 mt-10">
            <NavItem icon={Home} label="Home" active={view === 'dashboard'} onClick={() => navigateTo('dashboard')} />
            <NavItem icon={BookOpen} label="Recipes" active={view === 'recipes' || view === 'detail'} onClick={() => navigateTo('recipes')} />
            <NavItem icon={PenTool} label="Draft" active={view === 'generate'} onClick={() => navigateTo('generate')} />
            <div className="h-px bg-sidebar-border w-12 mx-auto my-2" />
            <NavItem icon={CalendarIcon} label="Plan" active={view === 'calendar'} onClick={() => navigateTo('calendar')} />
          </nav>

          <div className="flex flex-col gap-6 mt-auto">
            {/* <Bell className="w-6 h-6 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" /> */}
            <Settings
              className={`w-6 h-6 cursor-pointer hover:text-foreground transition-colors ${view === 'settings' ? 'text-foreground' : 'text-muted-foreground'}`}
              onClick={() => navigateTo('settings')}
            />
            <Moon
              className={`w-6 h-6 cursor-pointer hover:text-foreground transition-colors ${darkMode ? 'text-foreground fill-current' : 'text-muted-foreground'}`}
              onClick={toggleDarkMode}
            />
            <div className="w-10 h-10 rounded-full bg-muted overflow-hidden border-2 border-background shadow-sm grayscale hover:grayscale-0 transition-all">
              <img src="https://i.pravatar.cc/150?img=12" alt="User" />
            </div>
          </div>
        </aside>

        {/* MOBILE NAV */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 flex justify-around z-50 pb-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <Home className={`w-6 h-6 ${view === 'dashboard' ? 'text-foreground' : 'text-muted-foreground'}`} onClick={() => navigateTo('dashboard')} />
          <BookOpen className={`w-6 h-6 ${view === 'recipes' ? 'text-foreground' : 'text-muted-foreground'}`} onClick={() => navigateTo('recipes')} />
          <div className="bg-primary text-primary-foreground p-3 rounded-full -mt-8 shadow-lg border-4 border-background" onClick={() => navigateTo('generate')}>
            <Sparkles className="w-6 h-6" />
          </div>
          <Heart className="w-6 h-6 text-muted-foreground" onClick={() => navigateTo('recipes')} />
          <Settings className="w-6 h-6 text-muted-foreground" onClick={() => navigateTo('settings')} />
        </div>

        {/* MAIN CONTENT */}
        <main className="flex-1 md:ml-24 p-6 md:p-12 max-w-[1600px] mx-auto w-full pb-24 md:pb-10">
          {view === 'dashboard' && (
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
          )}
          {view === 'recipes' && (
            <RecipesList
              filteredRecipes={filteredRecipes}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              viewMode={viewMode}
              setViewMode={setViewMode}
              navigateTo={navigateTo}
              toggleFavorite={toggleFavorite}
            />
          )}
          {view === 'detail' && (
            <RecipeDetail
              activeRecipeId={activeRecipeId}
              recipes={recipes}
              navigateTo={navigateTo}
              toggleFavorite={toggleFavorite}
              addToMealPlan={addToMealPlan}
              handleDeleteRecipe={handleDeleteRecipe}
              generateVariation={generateVariation}
              selectedDate={selectedDate}
            />
          )}
          {view === 'add' && (
            <RecipeForm
              handleSaveRecipe={handleSaveRecipe}
              navigateTo={navigateTo}
            />
          )}
          {view === 'edit' && (
            <RecipeForm
              initialData={recipes.find(r => r.id === activeRecipeId)}
              handleSaveRecipe={handleSaveRecipe}
              navigateTo={navigateTo}
            />
          )}
          {view === 'generate' && (
            <GeneratorPage
              aiPrompt={aiPrompt}
              setAiPrompt={setAiPrompt}
              aiIngredients={aiIngredients}
              setAiIngredients={setAiIngredients}
              handleSaveRecipe={handleSaveRecipe}
            />
          )}
          {view === 'settings' && (
            <SettingsView
              recipes={recipes}
              mealPlan={mealPlan}
              handleImportData={handleImportData}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
            />
          )}
          {view === 'calendar' && (
            <CalendarPage
              recipes={recipes}
              mealPlan={mealPlan}
              setMealPlan={setMealPlan}
              groceryState={groceryState}
              setGroceryState={setGroceryState}
              navigateTo={navigateTo}
            />
          )}
        </main>
      </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}