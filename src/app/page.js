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
  ChefHat
} from 'lucide-react';

import DottedBackground from '@/components/DottedBackground';
import NavItem from '@/components/NavItem';
import Dashboard from '@/components/Dashboard';
import RecipesList from '@/components/RecipesList';
import RecipeDetail from '@/components/RecipeDetail';
import RecipeForm from '@/components/RecipeForm';
import GeneratorPage from '@/components/GeneratorPage';
import SettingsView from '@/components/SettingsView';

import { INITIAL_RECIPES } from '@/lib/data';
import { generateId } from '@/lib/helpers';

export default function App() {
  const [view, setView] = useState('dashboard');
  const [activeRecipeId, setActiveRecipeId] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [mealPlan, setMealPlan] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiIngredients, setAiIngredients] = useState('');

  useEffect(() => {
    const storedRecipes = localStorage.getItem('chefs_notebook_recipes');
    if (storedRecipes) {
      setRecipes(JSON.parse(storedRecipes));
    } else {
      setRecipes(INITIAL_RECIPES);
      localStorage.setItem('chefs_notebook_recipes', JSON.stringify(INITIAL_RECIPES));
    }
    const storedPlan = localStorage.getItem('chefs_notebook_mealplan');
    if (storedPlan) {
      setMealPlan(JSON.parse(storedPlan));
    }
    setLoading(false);
  }, []);

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

  const handleSaveRecipe = (recipe) => {
    if (recipe.id) {
      setRecipes(prev => prev.map(r => r.id === recipe.id ? { ...recipe, createdAt: r.createdAt } : r));
    } else {
      const newRecipe = { ...recipe, id: generateId(), favorite: false, createdAt: Date.now() };
      setRecipes(prev => [newRecipe, ...prev]);
    }
    setView('recipes');
  };

  const handleDeleteRecipe = (id) => {
    if (confirm('Tear this page out of your notebook?')) {
      setRecipes(prev => prev.filter(r => r.id !== id));
      const newPlan = { ...mealPlan };
      Object.keys(newPlan).forEach(date => {
        newPlan[date] = newPlan[date].filter(rId => rId !== id);
      });
      setMealPlan(newPlan);
      setView('recipes');
    }
  };

  const toggleFavorite = (e, id) => {
    e.stopPropagation();
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, favorite: !r.favorite } : r));
  };

  const addToMealPlan = (recipeId) => {
    const dateKey = selectedDate.toDateString();
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

  const handleImportData = (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.recipes && Array.isArray(data.recipes)) {
        setRecipes(data.recipes);
        setMealPlan(data.mealPlan || {});
        alert('Notebook restored successfully!');
      }
    } catch (e) {
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
    <div className="flex min-h-screen bg-dot-pattern text-stone-800 font-sans selection:bg-orange-200 selection:text-orange-900">
      <DottedBackground />

      {/* SIDEBAR - Leather Binding Look */}
      <aside className="hidden md:flex w-24 flex-col items-center py-8 bg-[#EAE7DC] border-r border-[#D6D3D1] fixed h-full z-50 shadow-[4px_0_15px_-3px_rgba(0,0,0,0.1)]">
        <div className="mb-10 p-3 bg-stone-800 text-[#FDFCF8] rounded-lg shadow-md transform rotate-[-2deg] border border-stone-700">
          <ChefHat className="w-6 h-6" />
        </div>

        <nav className="flex-1 flex flex-col gap-6 w-full px-4">
          <NavItem icon={Home} label="Home" active={view === 'dashboard'} onClick={() => navigateTo('dashboard')} />
          <NavItem icon={BookOpen} label="Recipes" active={view === 'recipes' || view === 'detail'} onClick={() => navigateTo('recipes')} />
          <NavItem icon={PenTool} label="Draft" active={view === 'generate'} onClick={() => navigateTo('generate')} highlight />
          <div className="h-px bg-stone-300 w-12 mx-auto my-2" />
          <NavItem icon={CalendarIcon} label="Plan" />
        </nav>

        <div className="flex flex-col gap-6 mt-auto">
          <Bell className="w-6 h-6 text-stone-400 cursor-pointer hover:text-stone-600 transition-colors" />
          <Settings
            className={`w-6 h-6 cursor-pointer hover:text-stone-600 transition-colors ${view === 'settings' ? 'text-stone-800' : 'text-stone-400'}`}
            onClick={() => navigateTo('settings')}
          />
          <div className="w-10 h-10 rounded-full bg-stone-300 overflow-hidden border-2 border-white shadow-sm grayscale hover:grayscale-0 transition-all">
            <img src="https://i.pravatar.cc/150?img=12" alt="User" />
          </div>
        </div>
      </aside>

      {/* MOBILE NAV */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#FDFCF8] border-t border-stone-200 p-4 flex justify-around z-50 pb-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <Home className={`w-6 h-6 ${view === 'dashboard' ? 'text-stone-800' : 'text-stone-400'}`} onClick={() => navigateTo('dashboard')} />
        <BookOpen className={`w-6 h-6 ${view === 'recipes' ? 'text-stone-800' : 'text-stone-400'}`} onClick={() => navigateTo('recipes')} />
        <div className="bg-stone-800 text-[#FDFCF8] p-3 rounded-full -mt-8 shadow-lg border-4 border-[#FDFCF8]" onClick={() => navigateTo('generate')}>
          <Sparkles className="w-6 h-6" />
        </div>
        <Heart className="w-6 h-6 text-stone-400" onClick={() => navigateTo('recipes')} />
        <Settings className="w-6 h-6 text-stone-400" onClick={() => navigateTo('settings')} />
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
          />
        )}
      </main>
    </div>
  );
}