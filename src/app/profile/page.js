'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@/context/UserContext';
import { useRecipes } from '@/context/RecipeContext';
import { useToast } from '@/context/ToastContext';

import {
    ChefHat,
    Utensils,
    Flame,
    Coffee,
    Heart,
    Edit2,
    Check,
    X,
    Camera,
    Beef,
    Soup,
    Globe,
    Zap,
    Leaf,
    Cookie,
    Wind,
    Moon,
    Waves,
    Scale,
    Users,
    Sparkles,
    Trash2,
    Link as LinkIcon,
    Upload,
    Pizza,
    Donut,
    Fish,
    Croissant,
    Grape,
    Drumstick,
    Trophy,
    Clock,
    Star,
    Brain,
    ChefHat as ChefHatIcon,
    History,
    Fingerprint,
    ShieldAlert,
    Save,
    Dna,
    Medal,
    Award,
    CookingPot,
    Ban,
    Compass,
    Thermometer,
    GraduationCap,
    Crown,
    Siren
} from 'lucide-react';

const AVATARS = [
    { id: 'Hat', icon: ChefHat, label: 'Chef', color: '#6F1D1B', bg: '#FCEAEA' },
    { id: 'Flame', icon: Flame, label: 'Firebrand', color: '#E85D04', bg: '#FFF3E6' },
    { id: 'Leaf', icon: Leaf, label: 'Plant Pioneer', color: '#2D6A4F', bg: '#E9F5EE' },
    { id: 'Donut', icon: Donut, label: 'Sugar Alchemist', color: '#FF70A6', bg: '#FFF0F5' },
    { id: 'Fish', icon: Fish, label: 'Ocean Voyager', color: '#0077B6', bg: '#E0F2FE' },
    { id: 'Globe', icon: Globe, label: 'Global Nomad', color: '#7209B7', bg: '#F3E8FF' },
    { id: 'Croissant', icon: Croissant, label: 'Dough Dealer', color: '#BB9457', bg: '#FFF9E5' },
    { id: 'Grape', icon: Grape, label: 'Wine Connoisseur', color: '#5A189A', bg: '#F5F3FF' },
    { id: 'Coffee', icon: Coffee, label: 'Caffeine Addict', color: '#432818', bg: '#F5EBE0' },
    { id: 'Drumstick', icon: Drumstick, label: 'Carnivore', color: '#900C3F', bg: '#FDF2F5' },
    { id: 'Pizza', icon: Pizza, label: 'Pizza Pro', color: '#D00000', bg: '#FFF1F1' },
    { id: 'Zap', icon: Zap, label: 'Kitchen Flash', color: '#FFB703', bg: '#FFF9E6' },
];

export default function ProfilePage() {
    const {
        chefName, setChefName,
        chefAvatar, setChefAvatar,
        chefImage, setChefImage,
        dietary, setDietary,
        allergies, setAllergies,
        cuisines, setCuisines,
        skillLevel, setSkillLevel,
        equipment, setEquipment,
        spiceTolerance, setSpiceTolerance,
        dislikes, setDislikes,
        typicalTime, setTypicalTime
    } = useUser();
    const { recipes, mealPlan } = useRecipes();
    const toast = useToast();

    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState(chefName);
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const [showUrlInput, setShowUrlInput] = useState(false);

    const pickerRef = useRef(null);

    // Calculate Stats
    const totalMasterpieces = recipes.length;
    const aiCollabs = recipes.filter(r => r.isAI).length;
    const manualRecipes = totalMasterpieces - aiCollabs;

    // Wall of Fame: 3 most recently favorited
    const wallOfFame = recipes
        .filter(r => r.favorite)
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, 3);

    // Kitchen Streak (Planned ahead for next 7 days)
    const getStreak = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let streak = 0;
        for (let i = 0; i < 7; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            if (mealPlan[d.toDateString()] && mealPlan[d.toDateString()].length > 0) {
                streak++;
            }
        }
        return streak;
    };

    const kitchenStreak = getStreak();

    // Total Cook Time (Past)
    const getTotalPastCookTime = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let totalMinutes = 0;
        Object.entries(mealPlan).forEach(([dateStr, recipeIds]) => {
            const planDate = new Date(dateStr);
            if (planDate < today) {
                recipeIds.forEach(id => {
                    const recipe = recipes.find(r => r.id === id);
                    if (recipe && recipe.time) {
                        const mins = parseInt(recipe.time.replace(/\D/g, ''));
                        if (!isNaN(mins)) totalMinutes += mins;
                    }
                });
            }
        });

        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        return { hours, mins, totalMinutes };
    };

    const pastCookTime = getTotalPastCookTime();

    // Handle click outside to close picker
    useEffect(() => {
        function handleClickOutside(event) {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setShowAvatarPicker(false);
                setShowUrlInput(false);
            }
        }
        if (showAvatarPicker) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showAvatarPicker]);

    // Dynamic Persona Logic with "NLP-ish" analysis
    const getPersona = (recipes) => {
        if (!recipes || recipes.length === 0) return { title: "Apprentice Chef", description: "Just starting your culinary journey.", icon: ChefHatIcon };

        const tagCounts = {};
        const cuisineStats = {};
        let totalTime = 0;
        let quickRecipes = 0;
        let complexRecipes = 0;
        let ingredientCount = 0;

        // Use basic regex to analyze titles and descriptions for common themes
        const allText = recipes.map(r => `${r.title} ${r.description} ${r.tags?.join(' ')}`).join(' ').toLowerCase();

        recipes.forEach(r => {
            r.tags?.forEach(tag => {
                const t = tag.toLowerCase();
                tagCounts[t] = (tagCounts[t] || 0) + 1;
            });

            if (r.time) {
                const mins = parseInt(r.time);
                if (!isNaN(mins)) {
                    totalTime += mins;
                    if (mins <= 20) quickRecipes++;
                    if (mins >= 60) complexRecipes++;
                }
            }

            if (r.ingredients) ingredientCount += r.ingredients.length;
        });

        const avgIngredients = ingredientCount / recipes.length;

        // PERSONA PRIORITY LIST

        // 1. Spice Explorer
        if (tagCounts['spicy'] >= 2 || tagCounts['hot'] >= 2 || /(chili|jalapeno|habanero|pepper)/.test(allText)) {
            return { title: "Spice Explorer", description: "Brave hunter of heat and bold global flavors.", icon: Flame };
        }

        // 2. Global Nomad
        const cuisines = ['indian', 'mexican', 'italian', 'french', 'japanese', 'chinese', 'thai', 'mediterranean'];
        let uniqueCuisines = 0;
        cuisines.forEach(c => { if (tagCounts[c] || allText.includes(c)) uniqueCuisines++; });
        if (uniqueCuisines >= 3) {
            return { title: "Global Nomad", description: "A culinary world-traveler with a diverse palate.", icon: Globe };
        }

        // 3. Efficiency Expert
        if (quickRecipes > recipes.length / 2 && recipes.length >= 3) {
            return { title: "Efficiency Expert", description: "Master of the 20-minute masterpiece.", icon: Zap };
        }

        // 4. Plant Pioneer
        if (tagCounts['vegan'] >= 3 || tagCounts['vegetarian'] >= 3 || /(tofu|chickpea|lentil|veggie)/.test(allText)) {
            return { title: "Plant Pioneer", description: "Nourishing the soul with green power.", icon: Leaf };
        }

        // 5. Sugar Alchemist
        if (tagCounts['sweet'] >= 2 || tagCounts['dessert'] >= 2 || /(cake|cookie|sugar|bake|pastry)/.test(allText)) {
            return { title: "Sugar Alchemist", description: "Turning flour and sugar into pure magic.", icon: Cookie };
        }

        // 6. Umami Architect
        if (tagCounts['savory'] >= 2 || /(soy|miso|mushroom|msg|parmesan)/.test(allText)) {
            return { title: "Umami Architect", description: "Designing deep, savory foundations for every dish.", icon: Soup };
        }

        // 7. Firebrand
        if (tagCounts['grill'] >= 2 || /(bbq|steak|charcoal|smoked|grill)/.test(allText)) {
            return { title: "Firebrand", description: "At home where there's smoke and high heat.", icon: Flame };
        }

        // 8. Midnight Snacker
        if (tagCounts['snack'] >= 3 || /(sandwich|toast|dip|quick bite)/.test(allText)) {
            return { title: "Midnight Snacker", description: "Solving hunger at any hour with effortless style.", icon: Moon };
        }

        // 9. Ocean Voyager
        if (tagCounts['seafood'] >= 2 || /(fish|shrimp|salmon|tuna|seafood)/.test(allText)) {
            return { title: "Ocean Voyager", description: "Bringing the freshness of the tides to the table.", icon: Waves };
        }

        // 10. Minimalist Maven
        if (avgIngredients < 6 && recipes.length >= 3) {
            return { title: "Minimalist Maven", description: "Proving that less is infinitely more.", icon: Scale };
        }

        // 11. Feast Facilitator
        if (complexRecipes >= 2 || avgIngredients > 12) {
            return { title: "Feast Facilitator", description: "Grand scale, grand flavors, grand memories.", icon: Users };
        }

        // 12. Comfort Curator
        if (/(stew|soup|braised|potato|mash|home)/.test(allText)) {
            return { title: "Comfort Curator", description: "A warm hug in every bowl and plate.", icon: Coffee };
        }

        // 13. Protein Pro
        if (tagCounts['meat'] >= 3 || /(chicken|pork|beef|lamb|turkey)/.test(allText)) {
            return { title: "Protein Pro", description: "Powering through with high-performance fuel.", icon: Beef };
        }

        // 14. Texture Trailblazer
        if (/(crunchy|crispy|silky|tender|velvet)/.test(allText)) {
            return { title: "Texture Trailblazer", description: "Finding the perfect mouthfeel in every bite.", icon: Sparkles };
        }

        // 15. Kitchen Legend
        if (recipes.length >= 15) {
            return { title: "Kitchen Legend", description: "Your notebook is a treasure trove of taste.", icon: ChefHatIcon };
        }

        return { title: "Dedicated Foodie", description: "Building a curated collection of favorites.", icon: Utensils };
    };

    const persona = getPersona(recipes);
    const selectedBadge = AVATARS.find(a => a.id === chefAvatar) || AVATARS[0];
    const CurrentAvatarIcon = selectedBadge.icon;

    const handleSaveName = () => {
        setChefName(tempName || 'Chef');
        setIsEditing(false);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setChefImage(reader.result);
                setShowAvatarPicker(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUrlImage = () => {
        if (urlInput) {
            setChefImage(urlInput);
            setUrlInput('');
            setShowUrlInput(false);
            setShowAvatarPicker(false);
        }
    };

    const removeImage = () => {
        setChefImage(null);
    };

    const handleSaveProfile = () => {
        toast.success('✓ Profile preferences saved and synchronized!');
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
            {/* Header / Identity Section */}
            <div className={`relative group rounded-2xl border-2 border-border bg-card p-8 md:p-12 shadow-xl sticky-note rotate-[-0.5deg] ${showAvatarPicker ? 'z-[60]' : 'z-10'}`}>
                {/* Background Decor - Wrapped to contain the grayscale icon while allowing picker to overlay primary container */}
                <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        {chefImage ? (
                            <div className="w-64 h-64 rounded-full bg-cover bg-center grayscale opacity-20" style={{ backgroundImage: `url(${chefImage})` }} />
                        ) : (
                            <CurrentAvatarIcon size={200} style={{ color: selectedBadge.color }} />
                        )}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                    {/* Avatar with Picker */}
                    <div className="relative" ref={pickerRef}>
                        <div
                            className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border-2 flex items-center justify-center shadow-inner overflow-hidden transition-colors duration-500"
                            style={{
                                backgroundColor: chefImage ? 'transparent' : selectedBadge.bg,
                                borderColor: chefImage ? 'rgba(var(--primary), 0.2)' : `${selectedBadge.color}40`
                            }}
                        >
                            {chefImage ? (
                                <img src={chefImage} alt="Chef" className="w-full h-full object-cover" />
                            ) : (
                                <CurrentAvatarIcon
                                    size={64}
                                    className="md:size-80"
                                    style={{ color: selectedBadge.color }}
                                />
                            )}
                        </div>
                        <button
                            onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                            className="absolute -bottom-2 -right-2 p-2 bg-secondary text-secondary-foreground rounded-lg border-2 border-border shadow-lg hover:scale-110 transition-transform z-20"
                        >
                            <Camera size={18} />
                        </button>

                        {/* Avatar Picker Modal/Dropdown */}
                        {showAvatarPicker && (
                            <div className="absolute top-full left-0 md:left-1/2 md:-translate-x-1/2 mt-4 p-6 bg-card border-2 border-border rounded-xl shadow-2xl z-50 w-80 sm:w-96 max-h-[70vh] overflow-y-auto animate-in zoom-in-95 duration-200 custom-scrollbar">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold font-serif text-sm uppercase tracking-wider">Choose Your Badge</h3>
                                        {chefImage && (
                                            <button onClick={removeImage} className="text-destructive hover:bg-destructive/10 p-1 rounded">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-4 gap-3 pt-2">
                                        {AVATARS.map((avatar) => (
                                            <button
                                                key={avatar.id}
                                                onClick={() => {
                                                    setChefAvatar(avatar.id);
                                                    setChefImage(null); // Clear custom image if preset selected
                                                    setShowAvatarPicker(false);
                                                }}
                                                title={avatar.label}
                                                style={{
                                                    backgroundColor: avatar.bg,
                                                    borderColor: (!chefImage && chefAvatar === avatar.id) ? avatar.color : 'transparent'
                                                }}
                                                className={`p-2 rounded-lg border-2 transition-all flex items-center justify-center hover:scale-105`}
                                            >
                                                <avatar.icon size={20} style={{ color: avatar.color }} />
                                            </button>
                                        ))}
                                    </div>

                                    <div className="border-t border-border pt-4 space-y-2 text-center">
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-2">Or Personalize</p>
                                        <div className="flex gap-2">
                                            <label className="flex-1 flex items-center justify-center gap-2 p-2 bg-muted hover:bg-border rounded-lg cursor-pointer transition-colors text-xs font-bold uppercase">
                                                <Upload size={14} />
                                                <span>Upload</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                            </label>

                                            <button
                                                onClick={() => setShowUrlInput(!showUrlInput)}
                                                className="flex-1 flex items-center justify-center gap-2 p-2 bg-muted hover:bg-border rounded-lg transition-colors text-xs font-bold uppercase"
                                            >
                                                <LinkIcon size={14} />
                                                <span>Link</span>
                                            </button>
                                        </div>

                                        {showUrlInput && (
                                            <div className="flex gap-2 mt-2 animate-in slide-in-from-top-2">
                                                <input
                                                    type="text"
                                                    placeholder="Paste image URL..."
                                                    className="flex-1 text-xs p-2 rounded border border-border bg-background outline-none"
                                                    value={urlInput}
                                                    onChange={(e) => setUrlInput(e.target.value)}
                                                />
                                                <button onClick={handleUrlImage} className="p-2 bg-primary text-primary-foreground rounded">
                                                    <Check size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div className="space-y-1">
                            {isEditing ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={tempName}
                                        onChange={(e) => setTempName(e.target.value)}
                                        className="text-3xl md:text-5xl font-serif font-bold bg-transparent border-b-2 border-primary outline-none text-foreground w-full max-w-md"
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                                    />
                                    <button onClick={handleSaveName} className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors">
                                        <Check size={24} />
                                    </button>
                                    <button onClick={() => { setIsEditing(false); setTempName(chefName); }} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors">
                                        <X size={24} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center md:justify-start gap-4 group/name">
                                    <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground">
                                        {chefName}
                                    </h1>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="opacity-0 group-hover/name:opacity-100 p-2 text-muted-foreground hover:text-primary transition-all"
                                    >
                                        <Edit2 size={20} />
                                    </button>
                                </div>
                            )}
                            <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold tracking-wider uppercase">
                                {persona.title}
                            </div>
                        </div>

                        <p className="text-xl md:text-2xl text-muted-foreground font-serif italic max-w-lg">
                            "{persona.description}"
                        </p>

                        <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
                            <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 border border-border/50 rounded-lg">
                                <span className="font-bold text-primary">{recipes.length}</span>
                                <span className="text-sm text-muted-foreground uppercase tracking-tight">Recipes</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 border border-border/50 rounded-lg">
                                <span className="font-bold text-primary">
                                    {recipes.filter(r => r.favorite).length}
                                </span>
                                <span className="text-sm text-muted-foreground uppercase tracking-tight">Favorites</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decorative Tape */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-secondary/40 border border-border/20 backdrop-blur-sm -rotate-2"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Masterpieces */}
                <div className="bg-card border-2 border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                        <Trophy size={100} />
                    </div>
                    <div className="flex flex-col gap-2 relative z-10">
                        <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-600 mb-2">
                            <Trophy size={20} />
                        </div>
                        <span className="text-3xl font-serif font-bold text-foreground">{totalMasterpieces}</span>
                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Masterpieces</span>
                    </div>
                </div>

                {/* Kitchen Streak */}
                <div className="bg-card border-2 border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                        <Flame size={100} />
                    </div>
                    <div className="flex flex-col gap-2 relative z-10">
                        <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-600 mb-2">
                            <Flame size={20} />
                        </div>
                        <span className="text-3xl font-serif font-bold text-foreground">{kitchenStreak}<span className="text-sm font-sans text-muted-foreground ml-1">/7 days</span></span>
                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Kitchen Streak</span>
                    </div>
                </div>

                {/* AI Collaborations */}
                <div className="bg-card border-2 border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                        <Brain size={100} />
                    </div>
                    <div className="flex flex-col gap-2 relative z-10">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 mb-2">
                            <Brain size={20} />
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-serif font-bold text-foreground">{aiCollabs}</span>
                            <span className="text-xs text-muted-foreground mb-1">Generated by Gemini</span>
                        </div>
                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">AI Collaborations</span>
                    </div>
                </div>

                {/* Past Cook Time */}
                <div className="bg-card border-2 border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                        <History size={100} />
                    </div>
                    <div className="flex flex-col gap-2 relative z-10">
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 mb-2">
                            <History size={20} />
                        </div>
                        <div className="flex items-end gap-1">
                            <span className="text-3xl font-serif font-bold text-foreground">{pastCookTime.hours}h</span>
                            <span className="text-2xl font-serif font-bold text-foreground">{pastCookTime.mins}m</span>
                        </div>
                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Time in Kitchen (Past)</span>
                    </div>
                </div>
            </div>

            {/* Dietary & Flavor DNA Section */}
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Dna size={24} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-serif font-bold text-foreground">Dietary & Flavor Profile</h2>
                        <p className="text-sm text-muted-foreground font-serif italic">Your personal profile informs your AI recipe generator.</p>
                    </div>
                    <div className="h-px flex-1 bg-border/50 ml-4"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Column 1: Safety & Dietary Philosophy */}
                    <div className="space-y-6">
                        <div className="bg-card border-2 border-border p-6 rounded-2xl shadow-sm space-y-4">
                            <h3 className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider text-muted-foreground">
                                <Siren size={18} className="text-destructive" />
                                Allergies & Safety
                            </h3>
                            <div className="space-y-3">
                                <p className="text-xs text-muted-foreground italic mb-2">Items I will NEVER suggest as core ingredients.</p>
                                <textarea
                                    value={allergies}
                                    onChange={(e) => setAllergies(e.target.value)}
                                    placeholder="e.g. Peanuts, Shellfish, Strawberries..."
                                    className="w-full bg-background border-2 border-border rounded-xl p-3 text-sm focus:border-primary outline-none min-h-[100px] resize-none font-serif"
                                />
                            </div>

                            <div className="space-y-3 pt-4 border-t border-border">
                                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Dietary Lifestyle</span>
                                <div className="flex flex-wrap gap-2">
                                    {['Vegan', 'Vegetarian', 'Gluten-Free', 'Keto', 'Paleo', 'Dairy-Free'].map(diet => (
                                        <button
                                            key={diet}
                                            onClick={() => {
                                                if (dietary.includes(diet)) {
                                                    setDietary(dietary.filter(d => d !== diet));
                                                } else {
                                                    setDietary([...dietary, diet]);
                                                }
                                            }}
                                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border-2 
                                                ${dietary.includes(diet)
                                                    ? 'bg-primary border-primary text-primary-foreground shadow-md'
                                                    : 'bg-background border-border text-muted-foreground hover:border-primary/50'}`}
                                        >
                                            {diet}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-card border-2 border-border p-6 rounded-2xl shadow-sm space-y-4">
                            <h3 className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider text-muted-foreground">
                                <Ban size={18} />
                                The "Never" List
                            </h3>
                            <div>
                                <p className="text-[10px] text-muted-foreground italic mb-3">Ingredients or flavors you simply dislike (e.g. Cilantro, Olives).</p>
                                <input
                                    type="text"
                                    value={dislikes}
                                    onChange={(e) => setDislikes(e.target.value)}
                                    placeholder="Enter dislikes..."
                                    className="w-full bg-background border-2 border-border rounded-xl p-3 text-sm focus:border-primary outline-none font-serif"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Column 2: The Global Palate */}
                    <div className="space-y-6">
                        <div className="bg-card border-2 border-border p-6 rounded-2xl shadow-sm space-y-4">
                            <h3 className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider text-muted-foreground">
                                <Compass size={18} />
                                Cuisine DNA
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                {['Italian', 'Indian', 'Mexican', 'Thai', 'Japanese', 'Chinese', 'French', 'Mediterranean', 'American', 'Middle Eastern', 'Spanish', 'Greek'].map(cuisine => (
                                    <button
                                        key={cuisine}
                                        onClick={() => {
                                            if (cuisines.includes(cuisine)) {
                                                setCuisines(cuisines.filter(c => c !== cuisine));
                                            } else {
                                                setCuisines([...cuisines, cuisine]);
                                            }
                                        }}
                                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border-2 text-left flex items-center justify-between
                                            ${cuisines.includes(cuisine)
                                                ? 'bg-blue-500/5 border-blue-500 text-blue-600 shadow-sm'
                                                : 'bg-background border-border text-muted-foreground hover:bg-muted/50'}`}
                                    >
                                        {cuisine}
                                        {cuisines.includes(cuisine) && <Check size={14} />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-card border-2 border-border p-6 rounded-2xl shadow-sm space-y-4">
                            <h3 className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider text-muted-foreground">
                                <Thermometer size={18} />
                                Heat Index
                            </h3>
                            <div className="space-y-2">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground block mb-2">Spice Tolerance</span>
                                <div className="flex bg-muted rounded-xl p-1">
                                    {['Mild', 'Medium', 'Hot'].map(level => (
                                        <button
                                            key={level}
                                            onClick={() => setSpiceTolerance(level)}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all
                                                ${spiceTolerance === level
                                                    ? 'bg-background text-primary shadow-sm'
                                                    : 'text-muted-foreground hover:text-foreground'}`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column 3: Tools & Mastery */}
                    <div className="space-y-6">
                        <div className="bg-card border-2 border-border p-6 rounded-2xl shadow-sm space-y-4">
                            <h3 className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider text-muted-foreground">
                                <CookingPot size={18} />
                                Kitchen Arsenal
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {['Air Fryer', 'Instant Pot', 'Cast Iron', 'Slow Cooker', 'Blender', 'Food Processor', 'Wok', 'Grill Pant', 'Oven', 'Microwave'].map(item => (
                                    <button
                                        key={item}
                                        onClick={() => {
                                            if (equipment.includes(item)) {
                                                setEquipment(equipment.filter(e => e !== item));
                                            } else {
                                                setEquipment([...equipment, item]);
                                            }
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border-2 
                                            ${equipment.includes(item)
                                                ? 'bg-teal-500/10 border-teal-500 text-teal-600'
                                                : 'bg-background border-border text-muted-foreground hover:border-teal-500/30'}`}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-card border-2 border-border p-6 rounded-2xl shadow-sm space-y-4">
                            <h3 className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider text-muted-foreground">
                                <GraduationCap size={18} />
                                Cooking Persona
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground block mb-2">Mastery Level</span>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                                            <button
                                                key={level}
                                                onClick={() => setSkillLevel(level)}
                                                className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border-2
                                                    ${skillLevel === level
                                                        ? 'bg-secondary border-primary text-primary'
                                                        : 'bg-background border-border text-muted-foreground'}`}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground block mb-2">Standard Velocity</span>
                                    <select
                                        value={typicalTime}
                                        onChange={(e) => setTypicalTime(e.target.value)}
                                        className="w-full bg-background border-2 border-border rounded-xl p-2 text-sm focus:border-primary outline-none font-serif"
                                    >
                                        <option value="15-20">15-20 min (Speedy)</option>
                                        <option value="30-45">30-45 min (Standard)</option>
                                        <option value="60+">60+ min (Grand Project)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Wall of Fame */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Crown className="text-yellow-500 fill-yellow-500" size={28} />
                    <h2 className="text-3xl font-serif font-bold text-foreground">The Wall of Fame</h2>
                    <div className="h-px flex-1 bg-border/50 ml-4"></div>
                </div>

                {wallOfFame.length > 0 ? (
                    <div className="flex gap-6 overflow-x-auto pb-6 pt-2 custom-scrollbar -mx-2 px-2">
                        {wallOfFame.map((recipe, idx) => (
                            <div
                                key={recipe.id}
                                className={`flex-shrink-0 w-[280px] md:w-[320px] bg-card border-2 border-border p-4 rounded-xl shadow-lg transform transition-all hover:scale-[1.02] hover:-rotate-1 relative
                                    ${idx % 2 === 0 ? 'rotate-1' : '-rotate-1'}
                                `}
                            >
                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-6 bg-secondary/30 border border-border/20 backdrop-blur-sm z-20"></div>
                                <div className="aspect-[4/3] rounded-lg overflow-hidden mb-4 border border-border">
                                    <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
                                </div>
                                <h3 className="font-serif font-bold text-xl mb-1 line-clamp-1">{recipe.title}</h3>
                                <p className="text-sm text-muted-foreground italic mb-3 line-clamp-2">"{recipe.description}"</p>
                                <div className="flex items-center justify-between mt-auto pt-2 border-t border-dashed border-border">
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground font-bold uppercase tracking-tighter">
                                        <Clock size={12} />
                                        <span>{recipe.time}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground font-bold uppercase tracking-tighter">
                                        <Flame size={12} className="text-orange-500" />
                                        <span>{recipe.difficulty}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-muted/30 border-2 border-dashed border-border rounded-2xl p-12 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center mx-auto text-muted-foreground">
                            <Medal size={32} />
                        </div>
                        <p className="font-serif italic text-muted-foreground text-lg">Favorite your masterpieces to see them displayed here.</p>
                    </div>
                )}
            </div>
            {/* Sticky Save Button */}
            <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-bottom-10">
                <button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-2 px-6 py-4 bg-primary text-primary-foreground rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all font-serif font-bold text-lg border-2 border-white/20"
                >
                    <Save size={24} />
                    <span>Save Changes</span>
                </button>
            </div>
        </div>
    );
}
