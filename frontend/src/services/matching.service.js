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

/**
 * Extract building/area from location string
 */
const extractBuilding = (loc) => {
    if (!loc) return null;
    const match = loc.match(/(library|academic|hostel|cafeteria|sports|lab|block [a-d])/i);
    return match ? match[0].toLowerCase() : null;
};

/**
 * Pre-process item for faster matching
 */
const preProcessItem = (item) => {
    if (item._processed) return item;

    return {
        ...item,
        _processed: true,
        _categoryLower: item.category ? item.category.toLowerCase() : '',
        _colorLower: item.color ? item.color.toLowerCase().trim() : '',
        _locationLower: item.location ? item.location.toLowerCase() : '',
        _building: extractBuilding(item.location),
        _date: item.createdAt ? (item.createdAt.toDate ? item.createdAt.toDate() : new Date(item.createdAt)) : null,
        _keywords: extractKeywords(item.description)
    };
};

/**
 * Calculate location proximity score
 */
const calculateLocationScore = (item1, item2) => {
    // Use pre-processed values if available
    const loc1 = item1._processed ? item1._locationLower : item1.location?.toLowerCase();
    const loc2 = item2._processed ? item2._locationLower : item2.location?.toLowerCase();

    if (!loc1 || !loc2) return 0;

    // Exact match
    if (loc1 === loc2) return 20;

    const building1 = item1._processed ? item1._building : extractBuilding(loc1);
    const building2 = item2._processed ? item2._building : extractBuilding(loc2);

    // Same building
    if (building1 && building2 && building1 === building2) return 15;

    // Check if both contain common area words
    const commonWords = ['library', 'academic', 'hostel', 'cafeteria', 'sports'];
    for (const word of commonWords) {
        if (loc1.includes(word) && loc2.includes(word)) {
            return 10;
        }
    }

    return 0;
};

/**
 * Calculate time proximity score
 */
const calculateTimeScore = (item1, item2) => {
    const d1 = item1._processed ? item1._date : (item1.createdAt?.toDate ? item1.createdAt.toDate() : new Date(item1.createdAt));
    const d2 = item2._processed ? item2._date : (item2.createdAt?.toDate ? item2.createdAt.toDate() : new Date(item2.createdAt));

    if (!d1 || !d2 || isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;

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
const calculateKeywordScore = (item1, item2) => {
    const keywords1 = item1._processed ? item1._keywords : extractKeywords(item1.description);
    const keywords2 = item2._processed ? item2._keywords : extractKeywords(item2.description);

    if (keywords1.size === 0 || keywords2.size === 0) return 0;

    // Find common keywords
    // Optimization: Iterate over the smaller set
    const [smaller, larger] = keywords1.size < keywords2.size ? [keywords1, keywords2] : [keywords2, keywords1];
    let commonCount = 0;
    for (const k of smaller) {
        if (larger.has(k)) commonCount++;
    }

    if (commonCount === 0) return 0;

    // Score based on percentage of matching keywords
    const matchPercentage = commonCount / smaller.size;
    return Math.min(matchPercentage * 10, 10);
};

/**
 * Calculate overall match score between two items
 */
export const calculateMatchScore = (item1, item2) => {
    let score = 0;

    // Prepare values
    const cat1 = item1._processed ? item1._categoryLower : item1.category?.toLowerCase();
    const cat2 = item2._processed ? item2._categoryLower : item2.category?.toLowerCase();

    const color1 = item1._processed ? item1._colorLower : item1.color?.toLowerCase().trim();
    const color2 = item2._processed ? item2._colorLower : item2.color?.toLowerCase().trim();

    // 1. Category Match (30 points)
    if (cat1 && cat2) {
        if (cat1 === cat2) {
            score += 30;
        } else {
            // Partial category match (e.g., "Phone" vs "Electronics")
            if (cat1.includes(cat2) || cat2.includes(cat1)) {
                score += 15;
            }
        }
    }

    // 2. Color Match (25 points)
    if (color1 && color2) {
        if (color1 === color2) {
            score += 25;
        } else {
            if (areSimilarColors(color1, color2)) {
                score += 15;
            }
        }
    }

    // 3. Location Proximity (20 points)
    score += calculateLocationScore(item1, item2);

    // 4. Time Window (15 points)
    score += calculateTimeScore(item1, item2);

    // 5. Description Keywords (10 points)
    score += calculateKeywordScore(item1, item2);

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

        // Pre-process the source item once
        const sourceItem = preProcessItem(item);

        // Calculate match scores
        // Pre-process candidate items and calculate score
        const matches = allItems.map(candidateItem => {
            const processedCandidate = preProcessItem(candidateItem);
            return {
                item: candidateItem,
                score: calculateMatchScore(sourceItem, processedCandidate),
                sourceItem: item
            };
        });

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
        const [lostItemsRaw, foundItemsRaw] = await Promise.all([
            getItems({ type: 'lost', status: 'active' }),
            getItems({ type: 'found', status: 'active' })
        ]);

        // Pre-process all items
        const lostItems = lostItemsRaw.map(preProcessItem);
        const foundItems = foundItemsRaw.map(preProcessItem);

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
