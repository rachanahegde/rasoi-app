import React, { useState, useEffect } from 'react';
import { PenTool, Loader2, ChefHat, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { saveApiKey, hasApiKey, removeApiKey, generateRecipeAction } from '@/app/actions';

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

    // Key management state
    const [keyInput, setKeyInput] = useState('');
    const [isKeySet, setIsKeySet] = useState(false);
    const [showKeyInput, setShowKeyInput] = useState(false); // For toggling visibility of input when key is already set
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
        try {
            const result = await generateRecipeAction(prompt, ingredients);
            setGenerated(result);
        } catch (error) {
            console.error("Generation failed:", error);
            alert(error.message || "Failed to generate recipe.");
        }
        setGenLoading(false);
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
                                        type="password"
                                        placeholder="Enter your Gemini API Key"
                                        className="bg-background border-input font-serif pr-20"
                                        value={keyInput}
                                        onChange={e => setKeyInput(e.target.value)}
                                    />
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
                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Idea Log</label>
                        <textarea
                            className="w-full p-4 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring transition-all min-h-[120px] font-serif text-lg leading-relaxed shadow-inner"
                            placeholder="I'm thinking something with basil and pasta, maybe spicy..."
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
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

                            <div className="flex gap-4 pt-4 border-t border-border">
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
