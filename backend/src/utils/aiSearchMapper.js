const axios = require('axios');

/**
 * Uses Gemini AI to translate unstructured or Roman Urdu search phrases
 * into a structured list of standard professional English job titles.
 * @param {string} rawQuery - The user's search text (e.g., "gari theek karny wala")
 * @returns {Promise<string[]>} - An array of standard job titles (e.g., ["Auto Mechanic", "Car Repair", "Technician"])
 */
const getSemanticJobTitles = async (rawQuery) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        
        // If no API key is set, gracefully fallback to word-by-word search
        if (!apiKey) {
            console.warn("⚠️ GEMINI_API_KEY is not set in backend/.env. Falling back to keyword-based search.");
            return rawQuery.split(/\s+/).map(w => w.trim()).filter(w => w.length > 2);
        }

        const prompt = `
System Role: You are an expert natural language processing engine inside a Job Board application. Your only job is to translate unstructured, slang, or Roman Urdu/Hindi search queries from blue-collar and white-collar workers into standard English professional job titles.

Input Query: "${rawQuery}"

Task: Extract or infer the standard professional job titles associated with this query. 

Rules:
1. EXACT FORMAT REQUIRED: ONLY return a native JSON array of strings. Do not include markdown formatting (like \`\`\`json). Just the raw array.
2. Limit to a maximum of 4 closely related standard job titles.
3. If the query is already standard (e.g. "Software Engineer" or "Plumber"), just return it in the array.
4. Make sure the output is pure JSON. Example: ["Mechanic", "Auto Technician", "Car Repair Technician"]
`;

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.1, // Low temperature for highly deterministic output
                    topP: 0.8,
                    topK: 40
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        // Extract the text content from the Gemini response structure
        const aiText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (aiText) {
            // Clean the text in case Gemini accidentally includes markdown code blocks
            const cleanedText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
            const jobTitles = JSON.parse(cleanedText);
            
            if (Array.isArray(jobTitles) && jobTitles.length > 0) {
                return jobTitles;
            }
        }

        // Fallback if AI response format was unexpected
        return [rawQuery];
    } catch (error) {
        console.error("[AI Search Mapper Error]:", error?.response?.data || error.message);
        // Fallback to word-by-word so the app never crashes
        return rawQuery.split(/\s+/).map(w => w.trim()).filter(w => w.length > 2);
    }
};

module.exports = {
    getSemanticJobTitles
};
