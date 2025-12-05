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
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, encryptedKey, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
        sameSite: 'strict'
    });
    return true;
}

export async function removeApiKey() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
    return true;
}

export async function hasApiKey() {
    const cookieStore = await cookies();
    return cookieStore.has(COOKIE_NAME);
}

export async function generateRecipeAction(prompt, ingredients) {
    const cookieStore = await cookies();
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

    const systemPrompt = `You are a chef. Create a concise recipe based on: "${prompt}" using: ${ingredients || 'any ingredients'}.

    Return ONLY valid JSON (no markdown):
    {
    "title": "Recipe name (max 8 words)",
    "description": "Brief description (max 20 words)",
    "time": "e.g. 30 min",
    "difficulty": "Easy/Medium/Hard",
    "calories": "e.g. 400 kcal",
    "tags": ["Provide exactly 5 tags including: 1. Meal Type (Breakfast/Lunch/Dinner/Snack), 2. Flavor Profile (Sweet/Savory), 3. Dietary (Vegetarian/Vegan/etc), 4. Cuisine (Italian/Indian/etc), 5. One other relevant tag"],
    "ingredients": ["List 6-10 ingredients with quantities"],
    "steps": ["5-8 clear, concise steps (each max 15 words)"]
    }

    Keep it brief and practical.`;

    try {
        // Import the SDK dynamically to use the decrypted API key
        const { GoogleGenerativeAI } = await import('@google/generative-ai');

        // Initialize the client with the decrypted API key
        const genAI = new GoogleGenerativeAI(apiKey);

        // Get the model - use the full model path for v1 API
        const model = genAI.getGenerativeModel({
            model: "models/gemini-flash-latest"
        });

        // Generate content using the SDK
        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();

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
