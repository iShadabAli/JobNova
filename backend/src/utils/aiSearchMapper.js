const axios = require('axios');

// Robust Offline Dictionary for common FYP demo phrases (acts as a safety net)
const localDictionary = {
    // Roman Urdu
    'ghar': ['house', 'home', 'building', 'construction', 'mason', 'builder', 'repair', 'fix', 'floor'],
    'gar': ['house', 'home', 'building', 'construction', 'mason', 'builder', 'repair', 'fix', 'floor'],
    'gari': ['car', 'auto', 'vehicle', 'mechanic', 'repair', 'fix', 'engine'],
    'bijli': ['electricity', 'electrician', 'wiring', 'power', 'light', 'cable', 'electrical'],
    'safai': ['cleaning', 'housekeeper', 'sweep', 'mop', 'maid', 'clean', 'janitor', 'wash'],
    'pani': ['plumber', 'pipe', 'water', 'leak', 'plumbing', 'fitting'],
    'pipe': ['plumber', 'pipe', 'water', 'leak', 'plumbing', 'fitting'],
    'lakri': ['carpenter', 'wood', 'furniture', 'woodwork', 'table', 'chair'],
    'khana': ['cook', 'chef', 'food', 'kitchen', 'catering', 'meal'],
    
    // Pure Urdu Script (This is what the browser actually returns in ur-PK mode)
    'گھر': ['house', 'home', 'building', 'construction', 'mason', 'builder', 'repair', 'fix', 'floor'],
    'مکان': ['house', 'home', 'building', 'construction', 'mason', 'builder', 'repair', 'fix', 'floor'],
    'گاڑی': ['car', 'auto', 'vehicle', 'mechanic', 'repair', 'fix', 'engine'],
    'بجلی': ['electricity', 'electrician', 'wiring', 'power', 'light', 'cable', 'electrical'],
    'صفائی': ['cleaning', 'housekeeper', 'sweep', 'mop', 'maid', 'clean', 'janitor', 'wash'],
    'پانی': ['plumber', 'pipe', 'water', 'leak', 'plumbing', 'fitting'],
    'پائپ': ['plumber', 'pipe', 'water', 'leak', 'plumbing', 'fitting'],
    'لکڑی': ['carpenter', 'wood', 'furniture', 'woodwork', 'table', 'chair'],
    'کھانا': ['cook', 'chef', 'food', 'kitchen', 'catering', 'meal'],
    'ٹھیک': ['repair', 'fix', 'mechanic', 'maintenance'],
    'بنانا': ['builder', 'construction', 'build', 'maker']
};

/**
 * Uses Gemini AI to translate unstructured or Roman Urdu search phrases
 * into a broad set of English keywords for database searching.
 * Has an offline dictionary fallback for reliable FYP demonstrations.
 * 
 * @param {string} rawQuery - The user's search text
 * @returns {Promise<string[]>} - An array of keywords
 */
const getSemanticJobTitles = async (rawQuery) => {
    const normalizedQuery = rawQuery.toLowerCase().trim();
    
    // 1. First check our offline dictionary for exact or partial word matches
    // Note: \b doesn't work for Unicode Urdu, so we use a robust regex or .includes
    const queryWords = normalizedQuery.split(/\s+/);
    
    for (const [key, keywords] of Object.entries(localDictionary)) {
        // Since we are matching single words like 'ghar', 'گھر', etc., we can just check if the query contains that exact word
        if (queryWords.includes(key) || normalizedQuery.includes(key + ' ')) {
            console.log(`[Offline Fallback] Found local dictionary match for: ${key}`);
            return keywords;
        }
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        
        // If no API key, use basic splitting
        if (!apiKey || apiKey === 'your_jwt_secret_key_here' || apiKey.includes('your_')) {
            console.warn("⚠️ GEMINI_API_KEY is missing or invalid. Falling back to basic word split.");
            return normalizedQuery.split(/\s+/).filter(w => w.length > 2);
        }

        const prompt = `
System Role: You are an expert natural language processing engine inside a Job Board application. Your only job is to translate unstructured, slang, or Roman Urdu/Hindi search queries from blue-collar and white-collar workers into a broad set of English keywords for database searching.

Input Query: "${rawQuery}"

Task: Extract and infer a wide net of single English keywords, root words, and synonyms associated with this query.

Rules:
1. EXACT FORMAT REQUIRED: ONLY return a native JSON array of strings. Do not include markdown formatting. Just the raw array.
2. Return up to 10 closely related English words (nouns, verbs, synonyms). Break down concepts into single roots (e.g. "ghar baana" -> ["house", "home", "building", "construction", "mason", "builder", "repair", "fix"]). 
3. Do NOT just return formal job titles. Return the component words and synonyms so that partial wildcard text searches on job descriptions will succeed.
4. Make sure the output is pure JSON array of strings. Example: ["car", "auto", "vehicle", "mechanic", "repair", "fix", "engine"]
`;

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.1, topP: 0.8, topK: 40 }
            },
            { headers: { 'Content-Type': 'application/json' } }
        );

        const aiText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (aiText) {
            const cleanedText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
            const jobTitles = JSON.parse(cleanedText);
            
            if (Array.isArray(jobTitles) && jobTitles.length > 0) {
                return jobTitles;
            }
        }

        return [rawQuery];
    } catch (error) {
        console.error("[AI Search Mapper Error]: API request failed. Using robust fallback.");
        return normalizedQuery.split(/\s+/).filter(w => w.length > 2);
    }
};

module.exports = {
    getSemanticJobTitles
};
