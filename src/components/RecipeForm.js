import React, { useState } from 'react';
import { ArrowLeft, X, Plus, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/context/ToastContext';

const RecipeForm = ({ initialData = {}, handleSaveRecipe, navigateTo }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        time: '',
        difficulty: 'Easy',
        calories: '',
        ingredients: [''],
        steps: [''],
        image: '',
        ...initialData,
        tags: initialData.tags ? initialData.tags.join(', ') : ''
    });
    const [imageUrl, setImageUrl] = useState(initialData.image || '');
    const [urlInput, setUrlInput] = useState('');
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [loadingImage, setLoadingImage] = useState(false);
    const toast = useToast();
    const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
    const handleArrayChange = (field, index, value) => {
        const newArray = [...formData[field]];
        newArray[index] = value;
        setFormData(prev => ({ ...prev, [field]: newArray }));
    };
    const addArrayItem = (field) => {
        setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
        if (field === 'ingredients') {
            toast.success('✓ Ingredient added');
        }
    };
    const removeArrayItem = (field, index) => setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
    
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setImageUrl(base64String);
                setFormData(prev => ({ ...prev, image: base64String }));
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
            // Fetch the image
            const response = await fetch(urlInput);
            if (!response.ok) throw new Error('Failed to fetch image');
            
            const blob = await response.blob();
            
            // Convert to base64
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setImageUrl(base64String);
                setFormData(prev => ({ ...prev, image: base64String }));
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

    const removeImage = () => {
        setImageUrl('');
        setUrlInput('');
        setFormData(prev => ({ ...prev, image: '' }));
        setShowUrlInput(false);
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        const recipeToSave = {
            ...formData,
            id: initialData.id,
            tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
            ingredients: formData.ingredients.filter(i => i),
            steps: formData.steps.filter(s => s),
            image: formData.image || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80'
        };
        handleSaveRecipe(recipeToSave);
    };

    return (
        <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500 pb-20">
            <Button variant="ghost" onClick={() => navigateTo('recipes')} className="mb-4 pl-0 font-serif italic">
                <ArrowLeft className="w-4 h-4 mr-2" /> Cancel Entry
            </Button>

            <div className="paper-card p-8 bg-card shadow-sm rounded-xl relative border border-border">
                <div className="absolute top-0 left-0 w-full h-2 bg-accent rounded-t-xl"></div>
                <h2 className="text-3xl font-serif font-bold mb-8 text-foreground">{initialData.id ? 'Edit Entry' : 'New Journal Entry'}</h2>
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Title</label>
                        <Input required value={formData.title} onChange={e => handleChange('title', e.target.value)} placeholder="e.g. Grandma's Apple Pie" className="text-xl font-serif bg-transparent border-b-2 border-border px-0" />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Time</label>
                            <Input required value={formData.time} onChange={e => handleChange('time', e.target.value)} placeholder="30 min" className="bg-muted" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Difficulty</label>
                            <select
                                className="flex h-11 w-full rounded-lg border border-input bg-muted px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring font-serif"
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
                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Calories</label>
                        <Input 
                            type="number" 
                            value={formData.calories} 
                            onChange={e => handleChange('calories', e.target.value)} 
                            placeholder="e.g. 350" 
                            className="bg-muted" 
                            min="0"
                        />
                        <p className="text-xs text-muted-foreground italic">Optional - calories per serving</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Notes / Description</label>
                        <textarea
                            className="flex min-h-[100px] w-full rounded-lg border border-input bg-muted px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-serif leading-relaxed"
                            value={formData.description}
                            onChange={e => handleChange('description', e.target.value)}
                            placeholder="Jot down your thoughts..."
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Recipe Image</label>
                        
                        {imageUrl ? (
                            <div className="relative group">
                                <div className="rounded-xl overflow-hidden border-2 border-border shadow-sm">
                                    <img 
                                        src={imageUrl} 
                                        alt="Recipe preview" 
                                        className="w-full h-64 object-cover"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-4 h-4 mr-1" /> Remove
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        id="image-upload"
                                    />
                                    <label
                                        htmlFor="image-upload"
                                        className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-xl cursor-pointer bg-muted/50 hover:bg-muted transition-colors group"
                                    >
                                        <Upload className="w-10 h-10 text-muted-foreground group-hover:text-foreground transition-colors mb-2" />
                                        <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                                            Click to upload an image
                                        </span>
                                        <span className="text-xs text-muted-foreground mt-1">
                                            PNG, JPG, GIF up to 10MB
                                        </span>
                                    </label>
                                </div>
                                
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
                                                className="bg-muted"
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
                                        >
                                            {loadingImage ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                                                    Loading Image...
                                                </>
                                            ) : (
                                                <>
                                                    <ImageIcon className="w-4 h-4 mr-2" />
                                                    Load Image from URL
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
                                    >
                                        <ImageIcon className="w-4 h-4 mr-2" />
                                        Use Image URL
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex justify-between items-center border-b border-border pb-2">Ingredients</label>
                        {formData.ingredients.map((ing, i) => (
                            <div key={i} className="flex gap-2 items-center">
                                <div className="w-4 h-4 border border-input rounded-sm"></div>
                                <Input value={ing} onChange={e => handleArrayChange('ingredients', i, e.target.value)} placeholder={`Item ${i + 1}`} className="border-b border-border border-t-0 border-x-0 bg-transparent px-0 h-9 rounded-none focus-visible:bg-transparent" />
                                {formData.ingredients.length > 1 && (
                                    <Button type="button" variant="ghost" onClick={() => removeArrayItem('ingredients', i)}><X className="w-4 h-4" /></Button>
                                )}
                            </div>
                        ))}
                        <Button type="button" variant="ghost" size="sm" onClick={() => addArrayItem('ingredients')} className="text-muted-foreground"><Plus className="w-4 h-4 mr-2" /> Add Item</Button>
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex justify-between items-center border-b border-border pb-2">Method</label>
                        {formData.steps.map((step, i) => (
                            <div key={i} className="flex gap-3 items-start">
                                <div className="mt-3 text-sm font-serif font-bold text-muted-foreground w-6 text-right">{i + 1}.</div>
                                <textarea className="flex min-h-[60px] w-full rounded-lg border border-input bg-muted px-3 py-2 text-sm focus:ring-2 focus:ring-ring font-serif" value={step} onChange={e => handleArrayChange('steps', i, e.target.value)} placeholder={`Step ${i + 1}...`} />
                                {formData.steps.length > 1 && (
                                    <Button type="button" variant="ghost" onClick={() => removeArrayItem('steps', i)} className="mt-1"><X className="w-4 h-4" /></Button>
                                )}
                            </div>
                        ))}
                        <Button type="button" variant="ghost" size="sm" onClick={() => addArrayItem('steps')} className="text-muted-foreground"><Plus className="w-4 h-4 mr-2" /> Add Step</Button>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Tags & Categories</label>
                        
                        {/* Display current tags as badges */}
                        {formData.tags && (
                            <div className="flex flex-wrap gap-2">
                                {formData.tags.split(',').map(t => t.trim()).filter(t => t).map((tag, idx) => (
                                    <span 
                                        key={idx}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const tags = formData.tags.split(',').map(t => t.trim()).filter(t => t);
                                                tags.splice(idx, 1);
                                                handleChange('tags', tags.join(', '));
                                            }}
                                            className="hover:text-destructive transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                        
                        {/* Input for new tags */}
                        <div className="flex gap-2">
                            <Input 
                                value={formData.tags} 
                                onChange={e => handleChange('tags', e.target.value)} 
                                placeholder="Type tags separated by commas..." 
                                className="bg-muted" 
                            />
                        </div>
                        
                        {/* Suggested tags */}
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">Quick Add:</p>
                            <div className="flex flex-wrap gap-2">
                                {['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Quick & Easy', 'Comfort Food', 'Healthy', 'Indian', 'Italian', 'Mexican', 'Asian'].map(suggestion => {
                                    const currentTags = formData.tags.split(',').map(t => t.trim()).filter(t => t);
                                    const isAdded = currentTags.includes(suggestion);
                                    return (
                                        <button
                                            key={suggestion}
                                            type="button"
                                            onClick={() => {
                                                if (!isAdded) {
                                                    const newTags = currentTags.concat(suggestion).join(', ');
                                                    handleChange('tags', newTags);
                                                }
                                            }}
                                            disabled={isAdded}
                                            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
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

                    <div className="pt-4 flex gap-4 border-t border-border mt-6">
                        <Button type="submit" className="flex-1" variant="primary">Save Entry</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RecipeForm;
