/**
 * Simple Levenshtein distance based fuzzy search
 */

export const getLevenshteinDistance = (a, b) => {
    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }

    return matrix[b.length][a.length];
};

/**
 * Checks if a search term matches a target string with some fuzzy tolerance
 * @param {string} target - The string to search in (e.g. job title)
 * @param {string} search - The query from the user
 * @param {number} threshold - Maximum edit distance allowed (relative to search length)
 */
export const fuzzyMatch = (target, search, threshold = 0.3) => {
    if (!search) return true;
    if (!target) return false;

    const t = target.toLowerCase();
    const s = search.toLowerCase();

    // Direct match check first
    if (t.includes(s)) return true;

    // Fuzzy check for multi-word queries
    const searchWords = s.split(/\s+/).filter(w => w.length > 2);
    const targetWords = t.split(/[\s,/-]+/).filter(w => w.length > 2);

    if (searchWords.length === 0) return t.includes(s);

    // Every search word should have a sufficiently close match in the target
    return searchWords.every(sw => {
        return targetWords.some(tw => {
            // If target word contains search word, it's a match
            if (tw.includes(sw)) return true;
            
            // Otherwise check edit distance
            const distance = getLevenshteinDistance(sw, tw);
            const maxAllowed = Math.floor(sw.length * threshold);
            return distance <= Math.max(1, maxAllowed);
        });
    });
};
