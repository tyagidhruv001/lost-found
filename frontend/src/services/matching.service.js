import { getItems } from './items.service';

/**
 * Smart Item Matching Service
 * Finds potential matches between lost and found items
 */

// Color similarity groups for partial matching
const COLOR_GROUPS = {
    dark: ['black', 'dark blue', 'dark brown', 'navy', 'dark gray', 'dark grey'],
    light: ['white', 'cream', 'beige', 'light gray', 'light grey', 'ivory', 'off-white'],
    blue: ['blue', 'navy', 'cyan', 'light blue', 'sky blue'],
    red: ['red', 'maroon', 'burgundy', 'crimson', 'scarlet'],
    green: ['green', 'lime', 'olive', 'forest green'],
    yellow: ['yellow', 'gold', 'mustard'],
    purple: ['purple', 'violet', 'lavender', 'magenta'],
    brown: ['brown', 'tan', 'chocolate', 'coffee'],
    pink: ['pink', 'rose', 'coral'],
    orange: ['orange', 'peach', 'coral']
};

// Common stop words to ignore in description matching
const STOP_WORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'was', 'are', 'were', 'be', 'been',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'can', 'i', 'you', 'he', 'she', 'it',
    'we', 'they', 'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her'
]);

/**
 * Check if two colors are in the same color group
 */
const areSimilarColors = (color1, color2) => {
    if (!color1 || !color2) return false;

    const c1 = color1.toLowerCase().trim();
    const c2 = color2.toLowerCase().trim();

    // Exact match
    if (c1 === c2) return true;

    // Check if in same color group
    for (const group of Object.values(COLOR_GROUPS)) {
        if (group.includes(c1) && group.includes(c2)) {
            return true;
        }
    }

    return false;
};

/**
 * Extract meaningful keywords from text
 */
const extractKeywords = (text) => {
    if (!text) return new Set();

    const words = text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ') // Remove punctuation
        .split(/\s+/)
        .filter(word => word.length > 2 && !STOP_WORDS.has(word));

    return new Set(words);
};

const BUILDING_REGEX = /(library|academic|hostel|cafeteria|sports|lab|block [a-d])/i;

/**
 * Calculate location proximity score
 */
const calculateLocationScore = (loc1, loc2) => {
    if (!loc1 || !loc2) return 0;

    const location1 = loc1.toLowerCase();
    const location2 = loc2.toLowerCase();

    // Exact match
    if (location1 === location2) return 20;

    // Extract building/area keywords
    const extractBuilding = (loc) => {
        const match = loc.match(BUILDING_REGEX);
        return match ? match[0].toLowerCase() : null;
    };

    const building1 = extractBuilding(location1);
    const building2 = extractBuilding(location2);

    // Same building
    if (building1 && building2 && building1 === building2) return 15;

    // Check if both contain common area words
    const commonWords = ['library', 'academic', 'hostel', 'cafeteria', 'sports'];
    for (const word of commonWords) {
        if (location1.includes(word) && location2.includes(word)) {
            return 10;
        }
    }

    return 0;
};

/**
 * Calculate time proximity score
 */
const calculateTimeScore = (date1, date2) => {
    if (!date1 || !date2) return 0;

    const d1 = date1?.toDate ? date1.toDate() : new Date(date1);
    const d2 = date2?.toDate ? date2.toDate() : new Date(date2);

    const diffMs = Math.abs(d1 - d2);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays <= 1) return 15;       // Same day or 24 hours
    if (diffDays <= 3) return 12;       // Within 3 days
    if (diffDays <= 7) return 8;        // Within a week
    if (diffDays <= 14) return 4;       // Within 2 weeks

    return 0;
};

/**
 * Calculate keyword match score
 */
const calculateKeywordScore = (desc1, desc2) => {
    const keywords1 = extractKeywords(desc1);
    const keywords2 = extractKeywords(desc2);

    if (keywords1.size === 0 || keywords2.size === 0) return 0;

    // Find common keywords
    const common = new Set([...keywords1].filter(k => keywords2.has(k)));

    if (common.size === 0) return 0;

    // Score based on percentage of matching keywords
    const matchPercentage = common.size / Math.min(keywords1.size, keywords2.size);
    return Math.min(matchPercentage * 10, 10);
};

/**
 * Calculate overall match score between two items
 */
export const calculateMatchScore = (item1, item2) => {
    let score = 0;

    // 1. Category Match (30 points)
    if (item1.category && item2.category) {
        if (item1.category.toLowerCase() === item2.category.toLowerCase()) {
            score += 30;
        } else {
            // Partial category match (e.g., "Phone" vs "Electronics")
            const cat1 = item1.category.toLowerCase();
            const cat2 = item2.category.toLowerCase();
            if (cat1.includes(cat2) || cat2.includes(cat1)) {
                score += 15;
            }
        }
    }

    // 2. Color Match (25 points)
    if (item1.color && item2.color) {
        if (item1.color.toLowerCase() === item2.color.toLowerCase()) {
            score += 25;
        } else if (areSimilarColors(item1.color, item2.color)) {
            score += 15; // Partial match for similar colors
        }
    }

    // 3. Location Proximity (20 points)
    score += calculateLocationScore(item1.location, item2.location);

    // 4. Time Window (15 points)
    score += calculateTimeScore(item1.createdAt, item2.createdAt);

    // 5. Description Keywords (10 points)
    score += calculateKeywordScore(item1.description, item2.description);

    return Math.round(score);
};

/**
 * Find potential matches for a given item
 */
export const findMatches = async (item, minScore = 40) => {
    try {
        // Get all items of opposite type
        const oppositeType = item.type === 'lost' ? 'found' : 'lost';
        const allItems = await getItems({ type: oppositeType, status: 'active' });

        // Calculate match scores
        const matches = allItems.map(candidateItem => ({
            item: candidateItem,
            score: calculateMatchScore(item, candidateItem),
            sourceItem: item
        }));

        // Filter by minimum score and sort by score descending
        return matches
            .filter(match => match.score >= minScore)
            .sort((a, b) => b.score - a.score);
    } catch (error) {
        console.error('Error finding matches:', error);
        return [];
    }
};

/**
 * Get all high-confidence matches across the entire system
 * Returns pairs of lost/found items with high match scores
 */
export const getAllMatches = async (minScore = 60) => {
    try {
        // Get all active lost and found items
        const [lostItems, foundItems] = await Promise.all([
            getItems({ type: 'lost', status: 'active' }),
            getItems({ type: 'found', status: 'active' })
        ]);

        const matches = [];

        // Compare each lost item with each found item
        for (const lostItem of lostItems) {
            for (const foundItem of foundItems) {
                const score = calculateMatchScore(lostItem, foundItem);

                if (score >= minScore) {
                    matches.push({
                        id: `${lostItem.id}-${foundItem.id}`,
                        lostItem,
                        foundItem,
                        score,
                        createdAt: new Date() // For sorting
                    });
                }
            }
        }

        // Sort by score descending
        return matches.sort((a, b) => b.score - a.score);
    } catch (error) {
        console.error('Error getting all matches:', error);
        return [];
    }
};

/**
 * Get top match recommendations for dashboard
 */
export const getMatchRecommendations = async (limit = 5) => {
    const allMatches = await getAllMatches(70); // Only excellent matches
    return allMatches.slice(0, limit);
};

/**
 * Get match confidence level label
 */
export const getMatchConfidenceLevel = (score) => {
    if (score >= 80) return { label: 'Excellent', color: 'emerald' };
    if (score >= 60) return { label: 'Good', color: 'amber' };
    if (score >= 40) return { label: 'Possible', color: 'slate' };
    return { label: 'Low', color: 'red' };
};

export default {
    calculateMatchScore,
    findMatches,
    getAllMatches,
    getMatchRecommendations,
    getMatchConfidenceLevel
};
