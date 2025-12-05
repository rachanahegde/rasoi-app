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
  Moon,
  User
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
import ActivityLog from '@/components/ActivityLog';

import { generateId } from '@/lib/helpers';
import { useRecipes } from '@/context/RecipeContext';
import { ToastProvider, useToast } from '@/context/ToastContext';
import { ActivityLogProvider, useActivityLog } from '@/context/ActivityLogContext';
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
    importData,
    reorderRecipes
  } = useRecipes();

  const toast = useToast();
  const { activities, addActivity } = useActivityLog();

  const [view, setView] = useState('dashboard');
  const [activeRecipeId, setActiveRecipeId] = useState(null);
  // recipes, mealPlan, loading, groceryState moved to context
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('manual');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiIngredients, setAiIngredients] = useState('');
  // groceryState moved to context
  const [darkMode, setDarkMode] = useState(false);

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
      addActivity('recipe_updated', `Updated: ${recipe.title}`);
    } else {
      addRecipe(recipe);
      toast.success('✓ Recipe saved to your notebook!');
      addActivity('recipe_added', `Added a new recipe: ${recipe.title}`, null, recipe.tags);
    }
    setView('recipes');
  };

  const handleDeleteRecipe = (id) => {
    if (confirm('Tear this page out of your notebook?')) {
      const recipe = recipes.find(r => r.id === id);
      deleteRecipe(id);
      toast.success('Recipe removed from notebook');
      if (recipe) {
        addActivity('recipe_deleted', `Removed: ${recipe.title}`);
      }
      setView('recipes');
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
    // Get the recipe info before removing for activity logging
    const recipesForDay = mealPlan[dateKey] || [];
    const recipeId = recipesForDay[indexToRemove];
    const recipe = recipes.find(r => r.id === recipeId);
    
    // Remove from meal plan
    removeFromMealPlanContext(dateKey, indexToRemove);
    
    // Log activity
    if (recipe) {
      const date = new Date(dateKey);
      const dateStr = date.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric' 
      });
      addActivity('meal_removed', `Removed "${recipe.title}" from ${dateStr}`);
    }
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
    // Ensure recipes is an array before filtering
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

    // Apply Filters
    // Apply Filters
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
      filtered = filtered.filter(r => r.isFavorite);
    }
    if (filterRecent) {
      // Filter recipes that have been added to meal plan in the last 7 days
      const recentActivity = activities
        .filter(a => a.type === 'added_to_meal_plan' && (Date.now() - new Date(a.timestamp).getTime()) < 7 * 24 * 60 * 60 * 1000)
        .map(a => a.details.split(': ')[1]?.trim()); // Extract recipe name roughly
      
      // This is a loose match, ideally we'd track recipe IDs in activity log
      // For now, let's match by title if possible, or skip if too complex without IDs
      // A better approach with current data:
      filtered = filtered.filter(r => recentActivity.some(name => name && r.title.includes(name)));
    }
    
    // Only sort if a specific sort order is selected (not 'manual')
    if (sortOrder !== 'manual') {
      return filtered.sort((a, b) => {
        if (sortOrder === 'newest') return b.createdAt - a.createdAt;
        if (sortOrder === 'oldest') return a.createdAt - b.createdAt;
        if (sortOrder === 'a-z') return a.title.localeCompare(b.title);
        if (sortOrder === 'z-a') return b.title.localeCompare(a.title);
        return 0;
      });
    }
    
    // Return in original order (manual/custom order)
    return filtered;
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
            <Bell 
              className={`w-6 h-6 cursor-pointer hover:text-foreground transition-colors ${view === 'activity' ? 'text-foreground' : 'text-muted-foreground'}`}
              onClick={() => navigateTo('activity')}
            />
            <Settings
              className={`w-6 h-6 cursor-pointer hover:text-foreground transition-colors ${view === 'settings' ? 'text-foreground' : 'text-muted-foreground'}`}
              onClick={() => navigateTo('settings')}
            />
            <Moon
              className={`w-6 h-6 cursor-pointer hover:text-foreground transition-colors ${darkMode ? 'text-foreground fill-current' : 'text-muted-foreground'}`}
              onClick={toggleDarkMode}
            />
            <div 
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border-2 border-border shadow-sm cursor-pointer hover:bg-muted-foreground/20 transition-all"
              onClick={() => navigateTo('profile')}
            >
              <User className="w-5 h-5 text-muted-foreground" />
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
            recipes={filteredRecipes} 
            allRecipes={recipes}
            onRecipeClick={(id) => navigateTo('detail', id)}
            onAddRecipe={() => navigateTo('generate')}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onReorder={reorderRecipes}
            
            // Pass filter props
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
          {view === 'activity' && (
            <ActivityLog activities={activities} />
          )}
          {view === 'profile' && (
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-serif font-bold text-foreground mb-4">Profile</h1>
              <p className="text-muted-foreground font-serif">Coming soon...</p>
            </div>
          )}
        </main>
      </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <ActivityLogProvider>
        <AppContent />
      </ActivityLogProvider>
    </ToastProvider>
  );
}