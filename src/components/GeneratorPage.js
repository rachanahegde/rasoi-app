import React, { useState, useEffect } from 'react';
import { PenTool, Loader2, ChefHat, Sparkles, Upload, Eye, EyeOff, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { saveApiKey, hasApiKey, removeApiKey, generateRecipeAction } from '@/app/actions';
import { useToast } from '@/context/ToastContext';
import { useActivityLog } from '@/context/ActivityLogContext';
import { suggestTags } from '@/lib/tagSuggestions';

const GeneratorPage = ({
    aiPrompt,
    setAiPrompt,
    aiIngredients,
    setAiIngredients,
    handleSaveRecipe
}) => {
    const [genLoading, setGenLoading] = useState(false);
    const [prompt, setPrompt] = useState(aiPrompt || '');
    const [ingredients, setIngredients] = useState(aiIngredients || '');
    const [generated, setGenerated] = useState(null);
    const [customImage, setCustomImage] = useState(null);
    const [urlInput, setUrlInput] = useState('');
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [loadingImage, setLoadingImage] = useState(false);
    const [customTags, setCustomTags] = useState('');
    const [suggestedTags, setSuggestedTags] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const toast = useToast();
    const { addActivity } = useActivityLog();

    // Key management state
    const [keyInput, setKeyInput] = useState('');
    const [isKeySet, setIsKeySet] = useState(false);
    const [showKeyInput, setShowKeyInput] = useState(false); // For toggling visibility of input when key is already set
    const [showKeyText, setShowKeyText] = useState(false); // For toggling password visibility
    const [checkingKey, setCheckingKey] = useState(true);

    useEffect(() => {
        checkKeyStatus();
    }, []);

    const checkKeyStatus = async () => {
        const hasKey = await hasApiKey();
        setIsKeySet(hasKey);
        setCheckingKey(false);
    };

    const handleSaveKey = async () => {
        if (!keyInput.trim()) return;
        await saveApiKey(keyInput);
        setIsKeySet(true);
        setKeyInput('');
        setShowKeyInput(false);
    };

    const handleRemoveKey = async () => {
        await removeApiKey();
        setIsKeySet(false);
        setShowKeyInput(true);
    };

    useEffect(() => {
        return () => { setAiPrompt(''); setAiIngredients(''); }
    }, [setAiPrompt, setAiIngredients]);

    const handleGenerate = async () => {
        if (!isKeySet) {
            alert("Please set your Gemini API Key first.");
            return;
        }
        setGenLoading(true);
        setGenerated(null);
        setCustomImage(null); // Reset custom image on new generation
        try {
            const result = await generateRecipeAction(prompt, ingredients);
            setGenerated(result);
            toast.success('✓ AI variation ready! Review and save below.');
            addActivity('variation_generated', `Generated AI variation: ${result.title}`);
            
            // Generate tag suggestions for the AI-generated recipe
            setLoadingSuggestions(true);
            try {
                const suggestions = await suggestTags({
                    title: result.title,
                    description: result.description || '',
                    ingredients: result.ingredients || [],
                    steps: result.steps || []
                });
                setSuggestedTags(suggestions);
                // Auto-populate with suggestions
                setCustomTags(suggestions.slice(0, 5).join(', '));
            } catch (error) {
                console.error('Error generating tag suggestions:', error);
            } finally {
                setLoadingSuggestions(false);
            }
        } catch (error) {
            console.error("Generation failed:", error);
            toast.error('✗ Failed to generate recipe. Please try again.');
        }
        setGenLoading(false);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (limit to 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('✗ Image size should be less than 5MB');
                return;
            }

            // Check file type
            if (!file.type.startsWith('image/')) {
                toast.error('✗ Please upload an image file');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setCustomImage(reader.result);
                toast.success('✓ Image uploaded successfully!');
            };
            reader.readAsDataURL(file);
        }
    };

    const loadImageFromUrl = async () => {
        if (!urlInput.trim()) {
            toast.error('✗ Please enter a valid image URL');
            return;
        }

        setLoadingImage(true);
        try {
            const response = await fetch(urlInput);
            if (!response.ok) throw new Error('Failed to fetch image');
            
            const blob = await response.blob();
            
            // Check file size
            if (blob.size > 5 * 1024 * 1024) {
                toast.error('✗ Image size should be less than 5MB');
                setLoadingImage(false);
                return;
            }
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setCustomImage(reader.result);
                setShowUrlInput(false);
                setUrlInput('');
                toast.success('✓ Image loaded successfully!');
            };
            reader.onerror = () => {
                toast.error('✗ Failed to process image');
            };
            reader.readAsDataURL(blob);
        } catch (error) {
            console.error('Error loading image:', error);
            toast.error('✗ Failed to load image. Please check the URL or try uploading instead.');
        } finally {
            setLoadingImage(false);
        }
    };

    const handleSaveWithImage = () => {
        const recipeToSave = {
            ...generated,
            image: customImage || generated.image,
            tags: customTags ? customTags.split(',').map(t => t.trim()).filter(t => t) : (generated.tags || [])
        };
        handleSaveRecipe(recipeToSave);
    };

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500">
            {/* Input Panel - Styled like a notepad */}
            <div className="flex-1 paper-card p-8 rounded-xl bg-card shadow-sm flex flex-col overflow-y-auto border border-border">
                <div className="mb-6 pb-4 border-b-2 border-dotted border-border">
                    <h1 className="text-3xl font-serif font-bold mb-2 flex items-center gap-2 text-foreground">
                        <PenTool className="w-6 h-6 text-muted-foreground" /> Creative Corner
                    </h1>
                    <p className="text-muted-foreground font-serif italic">Describe a craving, and let's draft a recipe together.</p>
                </div>

                <div className="space-y-6 flex-1">

                    {/* API Key Section */}
                    <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Gemini API Key</label>
                            {isKeySet && (
                                <button
                                    onClick={() => setShowKeyInput(!showKeyInput)}
                                    className="text-xs text-primary hover:underline"
                                >
                                    {showKeyInput ? 'Cancel Update' : 'Update Key'}
                                </button>
                            )}
                        </div>

                        {(!isKeySet || showKeyInput) ? (
                            <div className="space-y-2">
                                <div className="relative">
                                    <Input
                                        type={showKeyText ? "text" : "password"}
                                        placeholder="Enter your Gemini API Key"
                                        className="bg-background border-input font-serif pr-28"
                                        value={keyInput}
                                        onChange={e => setKeyInput(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-20 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                                        onClick={() => setShowKeyText(!showKeyText)}
                                    >
                                        {showKeyText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                    <Button
                                        size="sm"
                                        className="absolute right-1 top-1 h-8"
                                        onClick={handleSaveKey}
                                        disabled={!keyInput}
                                    >
                                        Save
                                    </Button>
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    Key is stored securely in an HttpOnly cookie and never exposed to client-side code.
                                </p>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between bg-background p-2 rounded border border-border">
                                <div className="flex items-center gap-2 text-sm text-green-600">
                                    <Sparkles className="w-4 h-4" />
                                    <span className="font-medium">API Key Active</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-xs text-destructive hover:text-destructive/90"
                                    onClick={handleRemoveKey}
                                >
                                    Remove
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Idea Log</label>
                            <span className="text-xs text-muted-foreground">
                                {prompt.length}/150
                            </span>
                        </div>
                        <textarea
                            className="w-full p-4 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring transition-all min-h-[120px] font-serif text-lg leading-relaxed shadow-inner"
                            placeholder="I'm thinking something with basil and pasta, maybe spicy..."
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            maxLength={150}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Pantry Items</label>
                        <Input
                            placeholder="What do we have on hand?"
                            className="bg-background border-input font-serif"
                            value={ingredients}
                            onChange={e => setIngredients(e.target.value)}
                        />
                    </div>

                    <div className="pt-4">
                        <Button
                            onClick={handleGenerate}
                            disabled={genLoading || !isKeySet || (!prompt && !ingredients)}
                            className="w-full h-14 text-lg bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 font-serif"
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
                        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6 animate-pulse border-4 border-double border-border">
                            <ChefHat className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-serif font-bold mb-2 text-muted-foreground">Consulting the notes...</h3>
                    </div>
                ) : generated ? (
                    <div className="animate-in slide-in-from-bottom-8 duration-700 pb-20 paper-card p-8 rounded-xl bg-card border border-border relative">
                        <div className="absolute top-4 right-4 text-muted-foreground">
                            <Sparkles className="w-8 h-8" />
                        </div>

                        <div className="mb-6">
                            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Draft Result</div>
                            <h2 className="text-3xl font-serif font-bold text-foreground mb-4 decoration-wavy underline decoration-border">{generated.title}</h2>
                            <p className="text-muted font-serif italic">{generated.description}</p>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-muted p-6 rounded-lg border border-border">
                                <h3 className="font-bold mb-4 text-sm uppercase tracking-widest text-muted-foreground">Ingredients</h3>
                                <ul className="grid grid-cols-2 gap-y-2 gap-x-4">
                                    {generated.ingredients.map((ing, i) => (
                                        <li key={i} className="flex items-center gap-2 text-foreground text-sm font-serif">
                                            <div className="w-3 h-3 border border-input rounded-sm"></div> {ing}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-card">
                                <h3 className="font-bold mb-4 text-sm uppercase tracking-widest text-muted-foreground">Method</h3>
                                <ol className="space-y-4 border-l border-border ml-2 pl-4">
                                    {generated.steps.map((step, i) => (
                                        <li key={i} className="text-foreground font-serif">
                                            <span className="font-bold text-muted-foreground text-xs mr-2">{i + 1}</span> {step}
                                        </li>
                                    ))}
                                </ol>
                            </div>

                            {/* Image Upload Section */}
                            <div className="bg-muted/30 p-6 rounded-lg border border-border">
                                <h3 className="font-bold mb-4 text-sm uppercase tracking-widest text-muted-foreground">Recipe Image</h3>

                                <div className="space-y-4">
                                    {/* Image Preview */}
                                    <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-border bg-muted">
                                        {(customImage || generated.image) ? (
                                            <img
                                                src={customImage || generated.image}
                                                alt="Recipe preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                <ChefHat className="w-12 h-12" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Upload Button */}
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            <label className="flex-1">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    className="hidden"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="w-full cursor-pointer"
                                                    onClick={(e) => e.currentTarget.previousElementSibling.click()}
                                                >
                                                    <Upload className="w-4 h-4 mr-2" />
                                                    {customImage ? 'Change Image' : 'Upload Image'}
                                                </Button>
                                            </label>
                                            {customImage && (
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setCustomImage(null);
                                                        setShowUrlInput(false);
                                                        setUrlInput('');
                                                    }}
                                                    className="text-muted-foreground hover:text-destructive"
                                                >
                                                    Remove
                                                </Button>
                                            )}
                                        </div>

                                        {!customImage && (
                                            <>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-px bg-border"></div>
                                                    <span className="text-xs text-muted-foreground uppercase tracking-wider">or</span>
                                                    <div className="flex-1 h-px bg-border"></div>
                                                </div>

                                                {showUrlInput ? (
                                                    <div className="space-y-2">
                                                        <div className="flex gap-2">
                                                            <Input
                                                                type="url"
                                                                placeholder="Paste image URL..."
                                                                value={urlInput}
                                                                onChange={(e) => setUrlInput(e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        e.preventDefault();
                                                                        loadImageFromUrl();
                                                                    }
                                                                }}
                                                                className="bg-muted text-sm"
                                                                disabled={loadingImage}
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                onClick={() => {
                                                                    setShowUrlInput(false);
                                                                    setUrlInput('');
                                                                }}
                                                                disabled={loadingImage}
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="default"
                                                            onClick={loadImageFromUrl}
                                                            disabled={loadingImage || !urlInput.trim()}
                                                            className="w-full"
                                                            size="sm"
                                                        >
                                                            {loadingImage ? (
                                                                <>
                                                                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                                                                    Loading...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <ImageIcon className="w-4 h-4 mr-2" />
                                                                    Load Image
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => setShowUrlInput(true)}
                                                        className="w-full"
                                                        size="sm"
                                                    >
                                                        <ImageIcon className="w-4 h-4 mr-2" />
                                                        Use Image URL
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Upload a custom image or paste an image URL (max 5MB)
                                    </p>
                                </div>
                            </div>

                            {/* Tags Section */}
                            <div className="border-t border-border pt-6">
                                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">Tags & Categories</h4>
                                
                                {/* Display current tags as badges */}
                                {customTags && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {customTags.split(',').map(t => t.trim()).filter(t => t).map((tag, idx) => (
                                            <span 
                                                key={idx}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                                            >
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const tags = customTags.split(',').map(t => t.trim()).filter(t => t);
                                                        tags.splice(idx, 1);
                                                        setCustomTags(tags.join(', '));
                                                    }}
                                                    className="hover:text-destructive transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                
                                {/* Input for tags */}
                                <Input 
                                    value={customTags} 
                                    onChange={e => setCustomTags(e.target.value)} 
                                    placeholder="Type tags separated by commas..." 
                                    className="bg-muted mb-3 text-sm" 
                                />
                                
                                {/* Smart Suggested Tags */}
                                {suggestedTags.length > 0 && (
                                    <div className="space-y-2 mb-3">
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs font-semibold text-primary">✨ Smart Suggestions:</p>
                                            {loadingSuggestions && (
                                                <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {suggestedTags.slice(0, 8).map(suggestion => (
                                                <button
                                                    key={suggestion}
                                                    type="button"
                                                    onClick={() => {
                                                        const currentTags = customTags.split(',').map(t => t.trim()).filter(t => t);
                                                        const newTags = currentTags.concat(suggestion).join(', ');
                                                        setCustomTags(newTags);
                                                    }}
                                                    className="px-2.5 py-1 rounded-full text-xs font-medium border bg-primary/5 text-primary border-primary/30 hover:bg-primary/10 hover:border-primary transition-colors"
                                                >
                                                    + {suggestion}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Suggested tags */}
                                <div className="space-y-2">
                                    <p className="text-xs text-muted-foreground">Quick Add:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Quick & Easy', 'Comfort Food', 'Healthy', 'Indian', 'Italian', 'Mexican', 'Asian'].map(suggestion => {
                                            const currentTags = customTags.split(',').map(t => t.trim()).filter(t => t);
                                            const isAdded = currentTags.includes(suggestion);
                                            return (
                                                <button
                                                    key={suggestion}
                                                    type="button"
                                                    onClick={() => {
                                                        if (!isAdded) {
                                                            const newTags = currentTags.concat(suggestion).join(', ');
                                                            setCustomTags(newTags);
                                                        }
                                                    }}
                                                    disabled={isAdded}
                                                    className={`px-2 py-0.5 rounded-full text-xs font-medium border transition-colors ${
                                                        isAdded 
                                                            ? 'bg-primary/10 text-primary border-primary/20 cursor-not-allowed opacity-50' 
                                                            : 'bg-muted text-muted-foreground border-border hover:border-primary hover:text-primary'
                                                    }`}
                                                >
                                                    {isAdded ? '✓ ' : '+ '}{suggestion}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-border">
                                <Button onClick={handleSaveWithImage} variant="accent" className="flex-1">
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
                        <div className="w-32 h-40 border-2 border-dashed border-muted-foreground rounded-lg flex items-center justify-center mb-4 bg-muted rotate-3">
                            <PenTool className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-serif font-bold text-muted-foreground">Blank Page</h3>
                        <p className="text-sm text-muted-foreground">Waiting for inspiration...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GeneratorPage;
