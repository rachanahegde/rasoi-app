'use client';

import React, { useState, useEffect } from 'react';
import {
  ChefHat,
  Home,
  Sparkles,
  Search,
  Plus,
  Clock,
  Flame,
  Trash2,
  Edit,
  Heart,
  ArrowLeft,
  Check,
  X,
  Loader2,
  Calendar as CalendarIcon,
  PlayCircle,
  Settings,
  Bell,
  ChevronRight,
  Utensils,
  Timer,
  MoreHorizontal,
  Filter,
  ArrowUpDown,
  CalendarDays,
  LayoutGrid,
  List,
  Copy,
  Download,
  Upload,
  Save,
  BookOpen,
  PenTool
} from 'lucide-react';

/**
 * STYLES & UTILITIES
 */

// We inject a style tag for the specific "Bullet Journal" dotted grid
const DottedBackground = () => (
  <style>{`
    .bg-dot-pattern {
      background-color: #FDFCF8;
      background-image: radial-gradient(#D6D3D1 1.5px, transparent 1.5px);
      background-size: 24px 24px;
    }
    .font-serif-custom {
      font-family: 'Georgia', 'Cambria', 'Times New Roman', serif;
    }
    .notebook-shadow {
      box-shadow: 3px 3px 0px 0px #E7E5E4; 
    }
    .paper-card {
      background: #FFFFFF;
      border: 1px solid #E7E5E4;
      box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }
    .handwritten-underline {
      background-image: linear-gradient(to right, #E7E5E4 50%, transparent 50%);
      background-position: bottom;
      background-size: 10px 1px;
      background-repeat: repeat-x;
    }
  `}</style>
);

const generateId = () => Math.random().toString(36).substr(2, 9);

const INITIAL_RECIPES = [
  {
    id: '1',
    title: 'Lemon Herb Salmon Salad',
    description: 'A fresh and healthy salad with grilled salmon, perfect for summer lunch.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    time: '45 min',
    difficulty: 'Easy',
    calories: '320 kcal',
    tags: ['Healthy', 'Fish', 'Gluten-Free'],
    ingredients: ['2 Salmon fillets', '1 Lemon', 'Fresh Dill', 'Mixed Lettuce', 'Cherry Tomatoes', 'Cucumber'],
    steps: ['Season salmon with lemon and herbs.', 'Grill for 4-5 minutes per side.', 'Chop vegetables and mix in a bowl.', 'Top with salmon and serve.'],
    favorite: true,
    createdAt: Date.now() - 100000
  },
  {
    id: '2',
    title: 'Rustic Chocolate Pie',
    description: 'Rich, creamy chocolate pie with a flaky crust.',
    image: 'https://images.unsplash.com/photo-1572383672419-ab4779963bb6?auto=format&fit=crop&w=800&q=80',
    time: '60 min',
    difficulty: 'Medium',
    calories: '450 kcal',
    tags: ['Dessert', 'Baking', 'Comfort'],
    ingredients: ['200g Dark Chocolate', '150g Butter', '3 Eggs', '100g Sugar', 'Pie Crust'],
    steps: ['Preheat oven to 180°C.', 'Melt chocolate and butter.', 'Whisk eggs and sugar, then fold in chocolate.', 'Pour into crust and bake for 25 mins.'],
    favorite: false,
    createdAt: Date.now()
  }
];

const mockGenerateRecipe = async (prompt, ingredients) => {
  const ingList = ingredients
    ? ingredients.split(',').map(i => i.trim())
    : ['Olive oil', 'Salt', 'Pepper', 'Fresh Herbs'];

  const mainIng = ingList[0] || "main ingredient";
  const steps = [
    "Prepare all ingredients and set up your cooking station.",
    `Heat a pan over medium heat and add a splash of oil or butter.`,
    `Add the ${mainIng} and sear until golden brown.`,
    `Incorporate the remaining ingredients (${ingList.slice(1).join(", ")}) slowly.`,
    "Season generously with salt and pepper.",
    "Simmer or roast until textures are tender.",
    "Plate the dish with attention to detail.",
    "Garnish with fresh herbs and serve immediately."
  ];

  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        title: prompt ? `Note: ${prompt}` : `Chef's Draft: ${mainIng}`,
        description: `A personal recipe draft generated for your taste, highlighting ${mainIng}.`,
        time: `${20 + Math.floor(Math.random() * 40)} min`,
        difficulty: "Medium",
        calories: `${350 + Math.floor(Math.random() * 400)} kcal`,
        tags: ['AI Draft', 'Notes', 'Fusion'],
        ingredients: ingList,
        steps,
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
        createdAt: Date.now()
      });
    }, 1500);
  });
};

/**
 * UI PRIMITIVES - WARM & COZY THEME
 */

const Button = ({ children, variant = 'primary', size = 'default', className = '', onClick, disabled, type = 'button' }) => {
  // Rounded corners but not fully pill-shaped for a card-stock feel
  const baseStyle = "inline-flex items-center justify-center rounded-lg font-serif-custom font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 disabled:pointer-events-none disabled:opacity-50";

  const variants = {
    // "Ink" black/dark brown
    primary: "bg-stone-800 text-[#FDFCF8] hover:bg-stone-700 shadow-md active:translate-y-0.5",
    // "Paper" white
    secondary: "bg-[#FDFCF8] text-stone-800 border border-stone-200 hover:bg-white hover:border-stone-300 shadow-sm",
    ghost: "hover:bg-stone-100 text-stone-600",
    danger: "bg-red-50 text-red-700 hover:bg-red-100 border border-red-100",
    outline: "border-2 border-stone-200 bg-transparent hover:bg-stone-50 text-stone-800 dashed-border",
    // "Highlighter" orange/sage
    accent: "bg-orange-200 text-stone-900 hover:bg-orange-300 border border-orange-300 shadow-sm"
  };

  const sizes = {
    default: "h-11 px-6 py-2",
    sm: "h-9 rounded-md px-3 text-xs",
    icon: "h-11 w-11",
    lg: "h-14 px-8 text-lg"
  };

  return (
    <button
      type={type}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Input = ({ className = '', ...props }) => (
  // Looks like a field in a logbook
  <input
    className={`flex h-11 w-full rounded-lg border-b-2 border-stone-200 border-t-0 border-x-0 bg-stone-50/50 px-3 py-2 text-sm placeholder:text-stone-400 focus-visible:outline-none focus-visible:border-stone-800 focus-visible:bg-white transition-colors ${className}`}
    {...props}
  />
);

const Badge = ({ children, className = '' }) => (
  // Looks like a small sticky note or stamp
  <div className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold font-serif-custom tracking-wide shadow-sm ${className}`}>
    {children}
  </div>
);

const Card = ({ children, className = '', onClick }) => (
  // Paper card effect
  <div onClick={onClick} className={`paper-card rounded-xl text-stone-800 ${className}`}>
    {children}
  </div>
);

/**
 * MAIN APP COMPONENT
 */

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
  const favoriteRecipes = recipes.filter(r => r.favorite);

  // --- VIEWS ---

  const Dashboard = () => {
    const today = new Date();
    const currentDay = today.getDay() === 0 ? 7 : today.getDay();
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - currentDay + i + 1);
      return d;
    });

    const selectedDateKey = selectedDate.toDateString();
    const todaysMeals = mealPlan[selectedDateKey] || [];

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header - Handwritten Style */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b-2 border-dashed border-stone-300">
          <div>
            <div className="flex items-center gap-2 text-stone-500 mb-1 font-medium font-serif-custom italic">
              <span>Good morning, Chef</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif-custom text-stone-800 leading-tight">
              <span className="text-stone-400 font-light">Today's</span> <br />
              Kitchen Notes
            </h1>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => navigateTo('generate')} variant="primary" className="rounded-full px-6">
              <Sparkles className="w-4 h-4 mr-2 text-orange-200" /> Draft New Idea
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Calendar / Journal Widget */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="paper-card p-1 bg-[#FFFDF5] relative overflow-hidden flex-1 rounded-xl shadow-sm border border-stone-200">
              {/* Spiral Binding Effect */}
              <div className="absolute top-0 left-4 bottom-0 w-8 border-r-2 border-dashed border-stone-200 flex flex-col gap-4 py-4 items-center opacity-20 pointer-events-none">
                {[...Array(10)].map((_, i) => <div key={i} className="w-3 h-3 rounded-full bg-stone-800"></div>)}
              </div>

              <div className="pl-12 pr-6 py-6 h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-serif-custom font-bold text-xl text-stone-800 flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-stone-600" />
                    Weekly Log
                  </h3>
                  <div className="text-xs font-serif-custom italic text-stone-500">{selectedDate.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</div>
                </div>

                {/* Date Grid */}
                <div className="grid grid-cols-7 gap-1 mb-6">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                    <div key={i} className="text-center text-[10px] font-bold text-stone-400 uppercase">{d}</div>
                  ))}
                  {weekDays.map((d, i) => {
                    const isSelected = d.toDateString() === selectedDate.toDateString();
                    const isToday = d.toDateString() === new Date().toDateString();
                    const hasPlan = mealPlan[d.toDateString()]?.length > 0;

                    return (
                      <div
                        key={i}
                        onClick={() => setSelectedDate(d)}
                        className={`
                              h-10 w-full flex flex-col items-center justify-center rounded-md text-sm font-serif-custom transition-all cursor-pointer relative
                              ${isSelected ? 'bg-stone-800 text-[#FDFCF8] shadow-md z-10' : 'text-stone-600 hover:bg-stone-100'}
                              ${isToday && !isSelected ? 'border border-stone-300' : ''}
                            `}
                      >
                        {d.getDate()}
                        {hasPlan && !isSelected && <div className="w-1 h-1 rounded-full bg-orange-400 mt-1" />}
                      </div>
                    )
                  })}
                </div>

                {/* Selected Day Plan - Looks like handwritten entries */}
                <div className="space-y-3 border-t-2 border-stone-100 pt-4 flex-1">
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                    Entries for {selectedDate.toLocaleDateString(undefined, { weekday: 'short' })}
                  </h4>
                  {todaysMeals.length > 0 ? (
                    todaysMeals.map((recipeId, idx) => {
                      const r = recipes.find(recipe => recipe.id === recipeId);
                      if (!r) return null;
                      return (
                        <div key={idx} className="group relative pl-6 py-2 cursor-pointer" onClick={() => navigateTo('detail', r.id)}>
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-full bg-stone-200 group-hover:bg-orange-300 transition-colors rounded-full"></div>
                          <div className="font-serif-custom font-medium text-stone-800 group-hover:text-orange-800 transition-colors">{r.title}</div>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeFromMealPlan(selectedDateKey, recipeId); }}
                            className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-400 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-4 text-stone-400 text-sm font-serif-custom italic border-2 border-dashed border-stone-100 rounded-lg text-center bg-stone-50/50">
                      Empty page...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Inspiration Cards - Polaroid / Sticker Style */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div onClick={() => { setSearchQuery('Summer'); navigateTo('recipes'); }} className="cursor-pointer bg-white p-3 rounded-xl shadow-sm rotate-[-1deg] hover:rotate-0 transition-transform duration-300 border border-stone-100">
              <div className="bg-orange-50 rounded-lg overflow-hidden aspect-square mb-3 relative">
                <img src="https://images.unsplash.com/photo-1544025162-d76690b67f61?auto=format&fit=crop&w=300&q=80" className="w-full h-full object-cover sepia-[.2]" alt="Grilling" />
                <div className="absolute inset-0 bg-gradient-to-t from-orange-900/20 to-transparent"></div>
              </div>
              <div className="text-center">
                <span className="font-serif-custom font-bold text-lg text-stone-800">Summer Grilling</span>
                <div className="h-1 w-12 bg-orange-200 mx-auto mt-1"></div>
              </div>
            </div>

            <div onClick={() => { setSearchQuery('Cozy'); navigateTo('recipes'); }} className="cursor-pointer bg-white p-3 rounded-xl shadow-sm rotate-[1deg] hover:rotate-0 transition-transform duration-300 border border-stone-100">
              <div className="bg-stone-100 rounded-lg overflow-hidden aspect-square mb-3 relative">
                <img src="https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=300&q=80" className="w-full h-full object-cover sepia-[.2]" alt="Roasting" />
              </div>
              <div className="text-center">
                <span className="font-serif-custom font-bold text-lg text-stone-800">Slow Roasts</span>
                <div className="h-1 w-12 bg-stone-300 mx-auto mt-1"></div>
              </div>
            </div>

            <div onClick={() => { setSearchQuery('Sweet'); navigateTo('recipes'); }} className="cursor-pointer bg-white p-3 rounded-xl shadow-sm rotate-[-2deg] hover:rotate-0 transition-transform duration-300 border border-stone-100">
              <div className="bg-blue-50 rounded-lg overflow-hidden aspect-square mb-3 relative">
                <img src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80" className="w-full h-full object-cover sepia-[.2]" alt="Baking" />
              </div>
              <div className="text-center">
                <span className="font-serif-custom font-bold text-lg text-stone-800">Sweet Treats</span>
                <div className="h-1 w-12 bg-blue-200 mx-auto mt-1"></div>
              </div>
            </div>
          </div>

          {/* Favorites */}
          <div className="lg:col-span-12 mt-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-serif-custom font-bold text-stone-800 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-400 fill-red-400" /> Loved Recipes
              </h3>
              <Button variant="ghost" onClick={() => navigateTo('recipes')} className="font-serif-custom italic">View All Index <ChevronRight className="w-4 h-4 ml-1" /></Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteRecipes.length > 0 ? favoriteRecipes.slice(0, 3).map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} onClick={() => navigateTo('detail', recipe.id)} onToggleFav={toggleFavorite} />
              )) : (
                <div className="col-span-full text-center py-12 bg-stone-50/50 rounded-xl border-2 border-dashed border-stone-200 text-stone-400 font-serif-custom italic">
                  No favorites marked yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const RecipesList = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-stone-200 pb-6">
        <h2 className="text-3xl font-serif-custom font-bold text-stone-800">Recipe Index</h2>
        <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
          {/* Search Bar - Logbook style */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <Input
              placeholder="Find in notebook..."
              className="pl-10 bg-white rounded-lg border-stone-200 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* View Toggle */}
          <div className="flex bg-white border border-stone-200 rounded-lg p-1 h-11 items-center shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-stone-100 text-stone-900' : 'text-stone-400 hover:text-stone-600'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-stone-100 text-stone-900' : 'text-stone-400 hover:text-stone-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button onClick={() => navigateTo('add')} variant="primary" className="rounded-lg">
            <Plus className="w-4 h-4 mr-2" /> Write New
          </Button>
        </div>
      </div>

      {filteredRecipes.length > 0 ? (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
          {filteredRecipes.map(recipe => (
            viewMode === 'grid' ? (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={() => navigateTo('detail', recipe.id)}
                onToggleFav={toggleFavorite}
              />
            ) : (
              <div
                key={recipe.id}
                onClick={() => navigateTo('detail', recipe.id)}
                className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-stone-200 hover:border-stone-300 shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <img src={recipe.image} className="w-20 h-20 rounded-lg object-cover sepia-[.15]" alt="thumb" />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-serif-custom font-bold text-lg text-stone-800">{recipe.title}</h3>
                    <button
                      onClick={(e) => toggleFavorite(e, recipe.id)}
                      className={`p-2 hover:bg-stone-100 rounded-full ${recipe.favorite ? 'text-red-500' : 'text-stone-300'}`}
                    >
                      <Heart className={`w-5 h-5 ${recipe.favorite ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  <p className="text-sm text-stone-500 line-clamp-1 mb-2 font-serif-custom italic">{recipe.description}</p>
                  <div className="flex items-center gap-4 text-xs font-medium text-stone-500">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {recipe.time}</span>
                    <span className="flex items-center gap-1"><Flame className="w-3 h-3" /> {recipe.calories || 'N/A'}</span>
                    <Badge className="bg-stone-100 text-stone-600 border-none">{recipe.difficulty}</Badge>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="bg-stone-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-stone-200">
            <Search className="w-8 h-8 text-stone-400" />
          </div>
          <h3 className="text-xl font-serif-custom text-stone-800">Page empty</h3>
          <p className="text-stone-500 font-serif-custom italic">No recipes found matching that description.</p>
        </div>
      )}
    </div>
  );

  const SettingsView = () => {
    const [importData, setImportData] = useState('');
    const handleCopy = () => {
      const data = JSON.stringify({ recipes, mealPlan }, null, 2);
      navigator.clipboard.writeText(data);
      alert('Copied to clipboard!');
    };
    return (
      <div className="max-w-2xl mx-auto animate-in fade-in duration-500 space-y-8 pb-20">
        <div className="border-b border-stone-200 pb-4">
          <h2 className="text-3xl font-serif-custom font-bold mb-2 text-stone-800">Notebook Settings</h2>
        </div>
        <Card className="p-8 bg-white">
          <h3 className="text-xl font-bold font-serif-custom mb-4 flex items-center gap-2 text-stone-800">
            <Download className="w-5 h-5" /> Backup Notes
          </h3>
          <div className="relative">
            <textarea
              readOnly
              className="w-full h-32 p-4 rounded-lg bg-stone-50 border border-stone-200 text-xs font-mono text-stone-600 resize-none focus:outline-none"
              value={JSON.stringify({ recipes, mealPlan }, null, 2)}
            />
            <Button size="sm" onClick={handleCopy} variant="secondary" className="absolute top-2 right-2 h-8">
              <Copy className="w-4 h-4 mr-2" /> Copy
            </Button>
          </div>
        </Card>
        <Card className="p-8 bg-white">
          <h3 className="text-xl font-bold font-serif-custom mb-4 flex items-center gap-2 text-stone-800">
            <Upload className="w-5 h-5" /> Restore Notes
          </h3>
          <textarea
            className="w-full h-32 p-4 rounded-lg bg-white border border-stone-200 text-xs font-mono resize-none focus:ring-2 focus:ring-stone-800 mb-4"
            placeholder="Paste data here..."
            value={importData}
            onChange={(e) => setImportData(e.target.value)}
          />
          <Button onClick={() => handleImportData(importData)} disabled={!importData} variant="primary">
            <Save className="w-4 h-4 mr-2" /> Restore
          </Button>
        </Card>
      </div>
    );
  };

  const RecipeDetail = () => {
    const recipe = recipes.find(r => r.id === activeRecipeId);
    if (!recipe) return <div>Not found</div>;

    return (
      <div className="max-w-4xl mx-auto animate-in zoom-in-95 duration-300 pb-20">
        <Button variant="ghost" onClick={() => navigateTo('recipes')} className="mb-4 pl-0 hover:bg-transparent hover:text-orange-700 font-serif-custom italic">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Index
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: Visuals */}
          <div className="space-y-6">
            <div className="relative aspect-[4/5] rounded-sm p-2 bg-white shadow-md border border-stone-200 -rotate-1">
              {/* Photo frame look */}
              <div className="h-full w-full overflow-hidden bg-stone-100 relative">
                <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover sepia-[.1]" />
                <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] pointer-events-none"></div>
              </div>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 bg-stone-100/50 rotate-1 backdrop-blur-sm border border-stone-200/50 flex items-center justify-center shadow-sm">
                <div className="w-2 h-2 rounded-full bg-stone-300 mr-2"></div>
                <div className="w-2 h-2 rounded-full bg-stone-300"></div>
              </div>
              <button
                onClick={(e) => toggleFavorite(e, recipe.id)}
                className="absolute bottom-6 right-6 bg-white p-3 rounded-full shadow-md hover:scale-110 transition-transform border border-stone-100"
              >
                <Heart className={`w-6 h-6 ${recipe.favorite ? 'fill-red-400 text-red-400' : 'text-stone-300'}`} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 text-center border-r border-stone-200">
                <Clock className="w-5 h-5 mx-auto mb-1 text-stone-500" />
                <div className="text-[10px] text-stone-400 uppercase tracking-widest">Time</div>
                <div className="font-serif-custom font-bold text-stone-800">{recipe.time}</div>
              </div>
              <div className="p-3 text-center border-r border-stone-200">
                <Flame className="w-5 h-5 mx-auto mb-1 text-stone-500" />
                <div className="text-[10px] text-stone-400 uppercase tracking-widest">Cals</div>
                <div className="font-serif-custom font-bold text-stone-800">{recipe.calories || '-'}</div>
              </div>
              <div className="p-3 text-center">
                <ChefHat className="w-5 h-5 mx-auto mb-1 text-stone-500" />
                <div className="text-[10px] text-stone-400 uppercase tracking-widest">Level</div>
                <div className="font-serif-custom font-bold text-stone-800">{recipe.difficulty}</div>
              </div>
            </div>

            <div
              onClick={() => addToMealPlan(recipe.id)}
              className="p-4 bg-stone-800 text-[#FDFCF8] rounded-lg flex items-center justify-between cursor-pointer hover:bg-stone-700 transition-colors shadow-md border-2 border-stone-800"
            >
              <div className="flex items-center gap-3">
                <CalendarDays className="w-5 h-5 text-orange-200" />
                <div className="text-sm">
                  <div className="font-bold font-serif-custom">Schedule this meal</div>
                  <div className="text-stone-400 text-xs italic">For {selectedDate.toLocaleDateString()}</div>
                </div>
              </div>
              <Plus className="w-5 h-5" />
            </div>
          </div>

          {/* Right: Journal Entry */}
          <div className="space-y-8 relative">
            {/* Paper texture background for text area */}
            <div className="absolute inset-0 bg-white border-l-2 border-dashed border-stone-200 -z-10 translate-x-4"></div>

            <div className="pl-6">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-4xl font-serif-custom font-bold text-stone-800 mb-2 underline decoration-orange-200 decoration-4 underline-offset-4">{recipe.title}</h1>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => navigateTo('edit', recipe.id)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-400 hover:bg-red-50" onClick={() => handleDeleteRecipe(recipe.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-stone-600 font-serif-custom italic leading-relaxed mb-4 text-lg">"{recipe.description}"</p>
              <div className="flex gap-2 flex-wrap">
                {recipe.tags.map(tag => (
                  <Badge key={tag} className="bg-orange-50 text-orange-800 border border-orange-100 transform rotate-1">{tag}</Badge>
                ))}
              </div>

              <Button
                variant="outline"
                className="mt-8 w-full border-dashed border-stone-300 text-stone-500 hover:text-stone-800 hover:border-stone-400 group font-serif-custom"
                onClick={() => generateVariation(recipe)}
              >
                <Sparkles className="w-4 h-4 mr-2 text-orange-400 group-hover:scale-125 transition-transform" /> Brainstorm variations
              </Button>
            </div>

            <div className="pl-6 pt-4">
              <h3 className="text-xl font-serif-custom font-bold mb-4 flex items-center gap-2 text-stone-800 border-b border-stone-200 pb-2">
                <Utensils className="w-5 h-5 text-stone-400" /> Shopping List
              </h3>
              <ul className="space-y-3">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-center gap-3 text-stone-700 group font-serif-custom text-lg">
                    <div className="w-5 h-5 border-2 border-stone-300 rounded-sm group-hover:border-stone-800 flex items-center justify-center transition-colors cursor-pointer bg-white">
                      <Check className="w-4 h-4 text-stone-800 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="handwritten-underline pb-1 decoration-stone-300 decoration-dotted">{ing}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pl-6 pt-4">
              <h3 className="text-xl font-serif-custom font-bold mb-4 flex items-center gap-2 text-stone-800 border-b border-stone-200 pb-2">
                <BookOpen className="w-5 h-5 text-stone-400" /> Method
              </h3>
              <div className="space-y-6 relative border-l-2 border-stone-100 ml-3 pl-6">
                {recipe.steps.map((step, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[33px] top-0 w-6 h-6 rounded-full bg-stone-100 text-stone-500 border border-stone-200 flex items-center justify-center font-serif-custom font-bold text-sm shadow-sm">
                      {i + 1}
                    </div>
                    <p className="text-stone-700 leading-relaxed font-serif-custom text-lg">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const RecipeForm = ({ initialData = {} }) => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      time: '',
      difficulty: 'Easy',
      ingredients: [''],
      steps: [''],
      ...initialData,
      tags: initialData.tags ? initialData.tags.join(', ') : ''
    });
    const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
    const handleArrayChange = (field, index, value) => {
      const newArray = [...formData[field]];
      newArray[index] = value;
      setFormData(prev => ({ ...prev, [field]: newArray }));
    };
    const addArrayItem = (field) => setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
    const removeArrayItem = (field, index) => setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
    const handleSubmit = (e) => {
      e.preventDefault();
      const recipeToSave = {
        ...formData,
        id: initialData.id,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        ingredients: formData.ingredients.filter(i => i),
        steps: formData.steps.filter(s => s),
        image: initialData.image || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80'
      };
      handleSaveRecipe(recipeToSave);
    };

    return (
      <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500 pb-20">
        <Button variant="ghost" onClick={() => navigateTo('recipes')} className="mb-4 pl-0 font-serif-custom italic">
          <ArrowLeft className="w-4 h-4 mr-2" /> Cancel Entry
        </Button>

        <div className="paper-card p-8 bg-[#FDFCF8] shadow-sm rounded-xl relative border border-stone-200">
          <div className="absolute top-0 left-0 w-full h-2 bg-orange-100 rounded-t-xl"></div>
          <h2 className="text-3xl font-serif-custom font-bold mb-8 text-stone-800">{initialData.id ? 'Edit Entry' : 'New Journal Entry'}</h2>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-500 uppercase tracking-widest">Title</label>
              <Input required value={formData.title} onChange={e => handleChange('title', e.target.value)} placeholder="e.g. Grandma's Apple Pie" className="text-xl font-serif-custom bg-transparent border-b-2 border-stone-200 px-0" />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-500 uppercase tracking-widest">Time</label>
                <Input required value={formData.time} onChange={e => handleChange('time', e.target.value)} placeholder="30 min" className="bg-stone-50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-500 uppercase tracking-widest">Difficulty</label>
                <select
                  className="flex h-11 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-stone-800 font-serif-custom"
                  value={formData.difficulty}
                  onChange={e => handleChange('difficulty', e.target.value)}
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-500 uppercase tracking-widest">Notes / Description</label>
              <textarea
                className="flex min-h-[100px] w-full rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm ring-offset-white placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-800 font-serif-custom leading-relaxed"
                value={formData.description}
                onChange={e => handleChange('description', e.target.value)}
                placeholder="Jot down your thoughts..."
              />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-stone-500 uppercase tracking-widest flex justify-between items-center border-b border-stone-200 pb-2">Ingredients</label>
              {formData.ingredients.map((ing, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <div className="w-4 h-4 border border-stone-300 rounded-sm"></div>
                  <Input value={ing} onChange={e => handleArrayChange('ingredients', i, e.target.value)} placeholder={`Item ${i + 1}`} className="border-b border-stone-200 border-t-0 border-x-0 bg-transparent px-0 h-9 rounded-none focus-visible:bg-transparent" />
                  {formData.ingredients.length > 1 && (
                    <Button type="button" variant="ghost" onClick={() => removeArrayItem('ingredients', i)}><X className="w-4 h-4" /></Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="ghost" size="sm" onClick={() => addArrayItem('ingredients')} className="text-stone-500"><Plus className="w-4 h-4 mr-2" /> Add Item</Button>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-stone-500 uppercase tracking-widest flex justify-between items-center border-b border-stone-200 pb-2">Method</label>
              {formData.steps.map((step, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="mt-3 text-sm font-serif-custom font-bold text-stone-400 w-6 text-right">{i + 1}.</div>
                  <textarea className="flex min-h-[60px] w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm focus:ring-2 focus:ring-stone-800 font-serif-custom" value={step} onChange={e => handleArrayChange('steps', i, e.target.value)} placeholder={`Step ${i + 1}...`} />
                  {formData.steps.length > 1 && (
                    <Button type="button" variant="ghost" onClick={() => removeArrayItem('steps', i)} className="mt-1"><X className="w-4 h-4" /></Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="ghost" size="sm" onClick={() => addArrayItem('steps')} className="text-stone-500"><Plus className="w-4 h-4 mr-2" /> Add Step</Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-500 uppercase tracking-widest">Tags</label>
              <Input value={formData.tags} onChange={e => handleChange('tags', e.target.value)} placeholder="Dinner, Comfort Food..." className="bg-stone-50" />
            </div>

            <div className="pt-4 flex gap-4 border-t border-stone-100 mt-6">
              <Button type="submit" className="flex-1" variant="primary">Save Entry</Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const GeneratorPage = () => {
    const [genLoading, setGenLoading] = useState(false);
    const [prompt, setPrompt] = useState(aiPrompt || '');
    const [ingredients, setIngredients] = useState(aiIngredients || '');
    const [generated, setGenerated] = useState(null);

    useEffect(() => {
      return () => { setAiPrompt(''); setAiIngredients(''); }
    }, []);

    const handleGenerate = async () => {
      setGenLoading(true);
      setGenerated(null);
      const result = await mockGenerateRecipe(prompt, ingredients);
      setGenerated(result);
      setGenLoading(false);
    };

    return (
      <div className="h-[calc(100vh-6rem)] flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500">
        {/* Input Panel - Styled like a notepad */}
        <div className="flex-1 paper-card p-8 rounded-xl bg-[#FFFDF5] shadow-sm flex flex-col overflow-y-auto border border-stone-200">
          <div className="mb-8 pb-4 border-b-2 border-dotted border-stone-300">
            <h1 className="text-3xl font-serif-custom font-bold mb-2 flex items-center gap-2 text-stone-800">
              <PenTool className="w-6 h-6 text-stone-600" /> Creative Corner
            </h1>
            <p className="text-stone-500 font-serif-custom italic">Describe a craving, and let's draft a recipe together.</p>
          </div>

          <div className="space-y-6 flex-1">
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-400 uppercase tracking-widest">Idea Log</label>
              <textarea
                className="w-full p-4 rounded-lg border border-stone-200 bg-white focus:ring-2 focus:ring-stone-400 transition-all min-h-[120px] font-serif-custom text-lg leading-relaxed shadow-inner"
                placeholder="I'm thinking something with basil and pasta, maybe spicy..."
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-400 uppercase tracking-widest">Pantry Items</label>
              <Input
                placeholder="What do we have on hand?"
                className="bg-white border-stone-200 font-serif-custom"
                value={ingredients}
                onChange={e => setIngredients(e.target.value)}
              />
            </div>

            <div className="pt-4">
              <Button
                onClick={handleGenerate}
                disabled={genLoading || (!prompt && !ingredients)}
                className="w-full h-14 text-lg bg-stone-800 text-[#FDFCF8] shadow-lg hover:bg-stone-700 font-serif-custom"
              >
                {genLoading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Drafting...</> : 'Draft Recipe'}
              </Button>
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div className="flex-1 lg:pl-6 overflow-y-auto custom-scrollbar">
          {genLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-24 h-24 rounded-full bg-stone-100 flex items-center justify-center mb-6 animate-pulse border-4 border-double border-stone-200">
                <ChefHat className="w-10 h-10 text-stone-400" />
              </div>
              <h3 className="text-xl font-serif-custom font-bold mb-2 text-stone-600">Consulting the notes...</h3>
            </div>
          ) : generated ? (
            <div className="animate-in slide-in-from-bottom-8 duration-700 pb-20 paper-card p-8 rounded-xl bg-white border border-stone-200 relative">
              <div className="absolute top-4 right-4 text-stone-300">
                <Sparkles className="w-8 h-8" />
              </div>

              <div className="mb-6">
                <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Draft Result</div>
                <h2 className="text-3xl font-serif-custom font-bold text-stone-800 mb-4 decoration-wavy underline decoration-stone-200">{generated.title}</h2>
                <p className="text-stone-600 font-serif-custom italic">{generated.description}</p>
              </div>

              <div className="space-y-6">
                <div className="bg-stone-50 p-6 rounded-lg border border-stone-100">
                  <h3 className="font-bold mb-4 text-sm uppercase tracking-widest text-stone-500">Ingredients</h3>
                  <ul className="grid grid-cols-2 gap-y-2 gap-x-4">
                    {generated.ingredients.map((ing, i) => (
                      <li key={i} className="flex items-center gap-2 text-stone-700 text-sm font-serif-custom">
                        <div className="w-3 h-3 border border-stone-400 rounded-sm"></div> {ing}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white">
                  <h3 className="font-bold mb-4 text-sm uppercase tracking-widest text-stone-500">Method</h3>
                  <ol className="space-y-4 border-l border-stone-200 ml-2 pl-4">
                    {generated.steps.map((step, i) => (
                      <li key={i} className="text-stone-700 font-serif-custom">
                        <span className="font-bold text-stone-400 text-xs mr-2">{i + 1}</span> {step}
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="flex gap-4 pt-4 border-t border-stone-100">
                  <Button onClick={() => handleSaveRecipe(generated)} variant="accent" className="flex-1">
                    Save to Notebook
                  </Button>
                  <Button variant="ghost" onClick={() => setGenerated(null)}>
                    Discard
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
              <div className="w-32 h-40 border-2 border-dashed border-stone-400 rounded-lg flex items-center justify-center mb-4 bg-stone-50 rotate-3">
                <PenTool className="w-8 h-8 text-stone-400" />
              </div>
              <h3 className="text-lg font-serif-custom font-bold text-stone-600">Blank Page</h3>
              <p className="text-sm text-stone-500">Waiting for inspiration...</p>
            </div>
          )}
        </div>
      </div>
    );
  };

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
          <NavItem icon={PlayCircle} label="Watch" />
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
        {view === 'dashboard' && <Dashboard />}
        {view === 'recipes' && <RecipesList />}
        {view === 'detail' && <RecipeDetail />}
        {view === 'add' && <RecipeForm />}
        {view === 'edit' && <RecipeForm initialData={recipes.find(r => r.id === activeRecipeId)} />}
        {view === 'generate' && <GeneratorPage />}
        {view === 'settings' && <SettingsView />}
      </main>
    </div>
  );
}

const NavItem = ({ icon: Icon, active, onClick, highlight, label }) => (
  <button
    onClick={onClick}
    className={`
      w-full aspect-square flex flex-col gap-1 items-center justify-center rounded-lg transition-all duration-300
      ${active ? 'bg-white text-stone-800 shadow-sm scale-105 border border-stone-200' : 'text-stone-400 hover:bg-stone-100/50 hover:text-stone-600'}
      ${highlight && !active ? 'bg-stone-200 text-stone-700 hover:bg-stone-300 shadow-inner' : ''}
    `}
    title={label}
  >
    <Icon className={`w-5 h-5 ${active ? 'text-stone-800' : ''} ${highlight && !active ? 'text-stone-700' : ''}`} />
  </button>
);

const RecipeCard = ({ recipe, onClick, onToggleFav }) => (
  <div
    onClick={onClick}
    className="group bg-white rounded-xl border border-stone-200 p-3 pb-5 cursor-pointer transition-all hover:shadow-md hover:-translate-y-1 relative overflow-hidden"
  >
    {/* Paper Texture Overlay */}
    <div className="absolute inset-0 bg-stone-50/10 pointer-events-none"></div>

    <div className="relative aspect-[4/3] mb-4 overflow-hidden rounded-lg border border-stone-100">
      <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 sepia-[.2] group-hover:sepia-0" />

      {/* Sticker Tag */}
      <div className="absolute bottom-2 left-2 bg-[#FFFDF5] px-2 py-1 text-[10px] font-bold uppercase tracking-widest border border-stone-200 shadow-sm text-stone-600">
        {recipe.time}
      </div>

      <button
        onClick={(e) => onToggleFav(e, recipe.id)}
        className="absolute top-2 right-2 bg-white/90 backdrop-blur p-2 rounded-full shadow-sm hover:bg-red-50 transition-colors"
      >
        <Heart className={`w-4 h-4 ${recipe.favorite ? 'fill-red-400 text-red-400' : 'text-stone-300'}`} />
      </button>
    </div>

    <div className="px-2">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-serif-custom font-bold text-lg leading-snug text-stone-800 line-clamp-2">{recipe.title}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {recipe.tags.slice(0, 2).map(tag => (
          <span key={tag} className="text-[10px] font-bold uppercase tracking-wider text-stone-500 bg-stone-100 px-2 py-1 rounded-sm border border-stone-200/50">{tag}</span>
        ))}
      </div>
    </div>
  </div>
);