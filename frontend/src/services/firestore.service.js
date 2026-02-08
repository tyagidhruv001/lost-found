import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Collections
const COLLECTIONS = {
    ITEMS: 'items',
    USERS: 'users',
    CLAIMS: 'claims'
};

// Helper to get emoji for category
const getCategoryEmoji = (category) => {
    const emojiMap = {
        'electronics': '🎧',
        'accessories': '🎒',
        'keys': '🔑',
        'wallet': '👛',
        'phone': '📱',
        'laptop': '💻',
        'books': '📚',
        'clothing': '👕',
        'jewelry': '💍',
        'cards': '💳',
        'id-cards': '🪪',
        'bags': '🎒',
        'stationery': '✏️',
        'other': '📦'
    };
    return emojiMap[category?.toLowerCase()] || '📦';
};

const getColorForCategory = (category) => {
    const colorMap = {
        'electronics': 'bg-blue-500/30',
        'accessories': 'bg-purple-500/30',
        'keys': 'bg-yellow-500/30',
        'wallet': 'bg-pink-500/30',
        'phone': 'bg-cyan-500/30',
        'laptop': 'bg-indigo-500/30',
        'books': 'bg-orange-500/30',
        'clothing': 'bg-red-500/30',
        'jewelry': 'bg-emerald-500/30',
        'cards': 'bg-teal-500/30',
        'id-cards': 'bg-slate-500/30',
        'bags': 'bg-purple-500/30',
        'stationery': 'bg-amber-500/30',
        'other': 'bg-gray-500/30'
    };
    return colorMap[category?.toLowerCase()] || 'bg-gray-500/30';
};

// Get latest activity (for landing page)
export const getLatestActivity = async (limitCount = 3) => {
    try {
        const itemsRef = collection(db, COLLECTIONS.ITEMS);
        const q = query(
            itemsRef,
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        const items = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            items.push({
                id: doc.id,
                emoji: getCategoryEmoji(data.category),
                bgColor: getColorForCategory(data.category),
                title: data.title,
                status: data.type === 'lost' ? 'Lost' : 'Found',
                statusColor: data.type === 'lost' ? 'text-red-400' : 'text-green-400',
                location: data.location,
                timestamp: data.createdAt?.toDate() || new Date()
            });
        });

        return items;
    } catch (error) {
        console.error('Error fetching latest activity:', error);
        return [];
    }
};

// Create new item (lost/found report)
export const createItem = async (itemData, userId) => {
    try {
        const itemsRef = collection(db, COLLECTIONS.ITEMS);
        const docRef = await addDoc(itemsRef, {
            ...itemData,
            reportedBy: userId,
            status: 'open',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        return {
            id: docRef.id,
            ...itemData
        };
    } catch (error) {
        console.error('Error creating item:', error);
        throw new Error('Failed to create item report');
    }
};

// Get all items with filters
export const getItems = async (filters = {}) => {
    try {
        const itemsRef = collection(db, COLLECTIONS.ITEMS);
        let q = query(itemsRef);

        // Apply filters
        if (filters.type) {
            q = query(q, where('type', '==', filters.type));
        }
        if (filters.category) {
            q = query(q, where('category', '==', filters.category));
        }
        if (filters.status) {
            q = query(q, where('status', '==', filters.status));
        }

        // Order by date
        q = query(q, orderBy('createdAt', 'desc'));

        const querySnapshot = await getDocs(q);
        const items = [];

        querySnapshot.forEach((doc) => {
            items.push({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
                updatedAt: doc.data().updatedAt?.toDate()
            });
        });

        return items;
    } catch (error) {
        console.error('Error fetching items:', error);
        return [];
    }
};

// Get single item by ID
export const getItemById = async (itemId) => {
    try {
        const itemRef = doc(db, COLLECTIONS.ITEMS, itemId);
        const itemDoc = await getDoc(itemRef);

        if (itemDoc.exists()) {
            return {
                id: itemDoc.id,
                ...itemDoc.data(),
                createdAt: itemDoc.data().createdAt?.toDate(),
                updatedAt: itemDoc.data().updatedAt?.toDate()
            };
        }

        return null;
    } catch (error) {
        console.error('Error fetching item:', error);
        return null;
    }
};

// Update item status
export const updateItemStatus = async (itemId, status) => {
    try {
        const itemRef = doc(db, COLLECTIONS.ITEMS, itemId);
        await updateDoc(itemRef, {
            status: status,
            updatedAt: serverTimestamp()
        });

        return { success: true };
    } catch (error) {
        console.error('Error updating item status:', error);
        throw new Error('Failed to update item status');
    }
};

// Get user's reports
export const getMyReports = async (userId) => {
    try {
        const itemsRef = collection(db, COLLECTIONS.ITEMS);
        const q = query(
            itemsRef,
            where('reportedBy', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const reports = [];

        querySnapshot.forEach((doc) => {
            reports.push({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
                updatedAt: doc.data().updatedAt?.toDate()
            });
        });

        return reports;
    } catch (error) {
        console.error('Error fetching user reports:', error);
        return [];
    }
};

// Create claim
export const createClaim = async (itemId, claimData, userId) => {
    try {
        const claimsRef = collection(db, COLLECTIONS.CLAIMS);
        const docRef = await addDoc(claimsRef, {
            itemId: itemId,
            claimantId: userId,
            ...claimData,
            status: 'pending',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        return {
            id: docRef.id,
            ...claimData
        };
    } catch (error) {
        console.error('Error creating claim:', error);
        throw new Error('Failed to create claim');
    }
};

// Get claims for faculty review
export const getPendingClaims = async () => {
    try {
        const claimsRef = collection(db, COLLECTIONS.CLAIMS);
        const q = query(
            claimsRef,
            where('status', '==', 'pending')
            // NOTE: Removed orderBy to avoid composite index requirement
            // Will sort in JavaScript instead
        );

        const querySnapshot = await getDocs(q);
        const claims = [];

        querySnapshot.forEach((doc) => {
            claims.push({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
                updatedAt: doc.data().updatedAt?.toDate()
            });
        });

        // Sort in memory by createdAt (newest first)
        claims.sort((a, b) => {
            const aTime = a.createdAt || new Date(0);
            const bTime = b.createdAt || new Date(0);
            return bTime - aTime; // Descending order (newest first)
        });

        return claims;
    } catch (error) {
        console.error('Error fetching pending claims:', error);
        return [];
    }
};

// Verify/Reject claim (faculty action)
export const verifyClaim = async (claimId, decision, note) => {
    try {
        // Get the claim to find the associated item
        const claimRef = doc(db, COLLECTIONS.CLAIMS, claimId);
        const claimDoc = await getDoc(claimRef);

        if (!claimDoc.exists()) {
            throw new Error('Claim not found');
        }

        const claimData = claimDoc.data();
        const itemId = claimData.itemId;

        // Update the claim status
        await updateDoc(claimRef, {
            status: decision, // 'approved' or 'rejected'
            verificationNote: note,
            verifiedAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        // Update the item status based on decision
        if (itemId) {
            const itemRef = doc(db, COLLECTIONS.ITEMS, itemId);

            if (decision === 'approved') {
                // Mark item as claimed
                await updateDoc(itemRef, {
                    status: 'claimed',
                    claimedBy: claimData.claimantId,
                    claimedAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
            }
            // If rejected, item stays active (no update needed)
        }

        return { success: true };
    } catch (error) {
        console.error('Error verifying claim:', error);
        throw new Error('Failed to verify claim');
    }
};

export default {
    getLatestActivity,
    createItem,
    getItems,
    getItemById,
    updateItemStatus,
    getMyReports,
    createClaim,
    getPendingClaims,
    verifyClaim
};
