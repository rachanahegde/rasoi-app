import React, { useState } from 'react';
import { ArrowLeft, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const RecipeForm = ({ initialData = {}, handleSaveRecipe, navigateTo }) => {
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
            <Button variant="ghost" onClick={() => navigateTo('recipes')} className="mb-4 pl-0 font-serif italic">
                <ArrowLeft className="w-4 h-4 mr-2" /> Cancel Entry
            </Button>

            <div className="paper-card p-8 bg-[#FDFCF8] shadow-sm rounded-xl relative border border-stone-200">
                <div className="absolute top-0 left-0 w-full h-2 bg-orange-100 rounded-t-xl"></div>
                <h2 className="text-3xl font-serif font-bold mb-8 text-stone-800">{initialData.id ? 'Edit Entry' : 'New Journal Entry'}</h2>
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-stone-500 uppercase tracking-widest">Title</label>
                        <Input required value={formData.title} onChange={e => handleChange('title', e.target.value)} placeholder="e.g. Grandma's Apple Pie" className="text-xl font-serif bg-transparent border-b-2 border-stone-200 px-0" />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-stone-500 uppercase tracking-widest">Time</label>
                            <Input required value={formData.time} onChange={e => handleChange('time', e.target.value)} placeholder="30 min" className="bg-stone-50" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-stone-500 uppercase tracking-widest">Difficulty</label>
                            <select
                                className="flex h-11 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-stone-800 font-serif"
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
                            className="flex min-h-[100px] w-full rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm ring-offset-white placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-800 font-serif leading-relaxed"
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
                                <div className="mt-3 text-sm font-serif font-bold text-stone-400 w-6 text-right">{i + 1}.</div>
                                <textarea className="flex min-h-[60px] w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm focus:ring-2 focus:ring-stone-800 font-serif" value={step} onChange={e => handleArrayChange('steps', i, e.target.value)} placeholder={`Step ${i + 1}...`} />
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

export default RecipeForm;
