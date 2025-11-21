'use server';

import { cookies } from 'next/headers';
import crypto from 'crypto';

const COOKIE_NAME = 'gemini_api_key';
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

// Get encryption key from environment variable
// In production, set this in your .env.local file
// For development, we'll generate a fallback (not recommended for production)
function getEncryptionKey() {
    const envKey = process.env.ENCRYPTION_SECRET;
    if (!envKey) {
        console.warn('ENCRYPTION_SECRET not set. Using fallback key. Set ENCRYPTION_SECRET in .env.local for production.');
        // Fallback for development only - in production you MUST set ENCRYPTION_SECRET
        return crypto.scryptSync('rasoi-app-default-secret-change-me', 'salt', 32);
    }
    return crypto.scryptSync(envKey, 'salt', 32);
}

// Encrypt the API key
function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Combine iv + authTag + encrypted data
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

// Decrypt the API key
function decrypt(encryptedData) {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

export async function saveApiKey(key) {
    const encryptedKey = encrypt(key);
    cookies().set(COOKIE_NAME, encryptedKey, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
        sameSite: 'strict'
    });
    return true;
}

export async function removeApiKey() {
    cookies().delete(COOKIE_NAME);
    return true;
}

export async function hasApiKey() {
    const cookieStore = cookies();
    return cookieStore.has(COOKIE_NAME);
}

export async function generateRecipeAction(prompt, ingredients) {
    const cookieStore = cookies();
    const encryptedKey = cookieStore.get(COOKIE_NAME)?.value;

    if (!encryptedKey) {
        throw new Error('API Key not found. Please set your API key first.');
    }

    let apiKey;
    try {
        apiKey = decrypt(encryptedKey);
    } catch (error) {
        console.error('Failed to decrypt API key:', error);
        throw new Error('Failed to decrypt API key. Please re-enter your key.');
    }

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
}
