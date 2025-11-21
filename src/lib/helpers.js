export const generateId = () => Math.random().toString(36).substr(2, 9);

export const generateRecipe = async (prompt, ingredients, apiKey) => {
    const systemPrompt = `
    You are a professional chef. Create a unique, detailed recipe based on the user's request.
    
    User Request: ${prompt}
    Available Ingredients: ${ingredients}
    
    Return the response ONLY as a valid JSON object with the following structure:
    {
        "title": "Recipe Title",
        "description": "A brief, appetizing description",
        "time": "Total time (e.g. 45 min)",
        "difficulty": "Easy/Medium/Hard",
        "calories": "Estimated calories per serving (e.g. 450 kcal)",
        "tags": ["Tag1", "Tag2"],
        "ingredients": ["Ingredient 1", "Ingredient 2"],
        "steps": ["Step 1", "Step 2"]
    }
    Do not include any markdown formatting like \`\`\`json. Just the raw JSON object.
    `;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: systemPrompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to generate recipe');
        }

        const data = await response.json();

        if (!data.candidates || data.candidates.length === 0) {
            throw new Error('No response from AI');
        }

        const text = data.candidates[0].content.parts[0].text;

        // Clean up potential markdown code blocks
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const recipe = JSON.parse(jsonStr);

        // Add a random image or placeholder
        recipe.image = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";
        recipe.createdAt = Date.now();

        return recipe;
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
};
