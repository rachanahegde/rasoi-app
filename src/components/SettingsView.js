import React, { useState } from 'react';
import { Download, Copy, Upload, Save, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const SettingsView = ({ recipes, mealPlan, handleImportData, darkMode, toggleDarkMode }) => {
    const [importData, setImportData] = useState('');
    const handleCopy = () => {
        const data = JSON.stringify({ recipes, mealPlan }, null, 2);
        navigator.clipboard.writeText(data);
        alert('Copied to clipboard!');
    };
    return (
        <div className="max-w-2xl mx-auto animate-in fade-in duration-500 space-y-8 pb-20">
            <div className="border-b border-border pb-4">
                <h2 className="text-3xl font-serif font-bold mb-2 text-foreground">Notebook Settings</h2>
            </div>

            <Card className="p-8 bg-card">
                <h3 className="text-xl font-bold font-serif mb-4 flex items-center gap-2 text-foreground">
                    {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />} Appearance
                </h3>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-foreground">Dark Mode</p>
                        <p className="text-sm text-muted-foreground">Switch between light and dark themes.</p>
                    </div>
                    <Button onClick={toggleDarkMode} variant="outline">
                        {darkMode ? 'Disable Dark Mode' : 'Enable Dark Mode'}
                    </Button>
                </div>
            </Card>
            <Card className="p-8 bg-card">
                <h3 className="text-xl font-bold font-serif mb-4 flex items-center gap-2 text-foreground">
                    <Download className="w-5 h-5" /> Backup Notes
                </h3>
                <div className="relative">
                    <textarea
                        readOnly
                        className="w-full h-32 p-4 rounded-lg bg-muted border border-border text-xs font-mono text-muted-foreground resize-none focus:outline-none"
                        value={JSON.stringify({ recipes, mealPlan }, null, 2)}
                    />
                    <Button size="sm" onClick={handleCopy} variant="secondary" className="absolute top-2 right-2 h-8">
                        <Copy className="w-4 h-4 mr-2" /> Copy
                    </Button>
                </div>
            </Card>
            <Card className="p-8 bg-card">
                <h3 className="text-xl font-bold font-serif mb-4 flex items-center gap-2 text-foreground">
                    <Upload className="w-5 h-5" /> Restore Notes
                </h3>
                <textarea
                    className="w-full h-32 p-4 rounded-lg bg-background border border-border text-xs font-mono resize-none focus:ring-2 focus:ring-ring mb-4"
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

export default SettingsView;
