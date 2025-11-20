export const generateId = () => Math.random().toString(36).substr(2, 9);

export const mockGenerateRecipe = async (prompt, ingredients) => {
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
