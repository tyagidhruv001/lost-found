import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { uploadMultipleImagesDirect } from './cloudinary.service';

// Collection name
const ITEMS_COLLECTION = 'items';

/**
 * Create a new lost/found item report
 */
export const createItem = async (itemData, userProfile) => {
    try {
        const itemRef = doc(collection(db, ITEMS_COLLECTION));

        const item = {
            id: itemRef.id,
            type: itemData.type,
            title: itemData.title,
            category: itemData.category,
            location: itemData.location,
            lastTimeSeen: itemData.lastTimeSeen || null,
            color: itemData.color || '',
            description: itemData.description || '',
            images: itemData.images || [],
            reportedBy: {
                uid: userProfile.uid,
                name: userProfile.name,
                email: userProfile.email || userProfile.personalEmail,
                identifier: userProfile.identifier,
                role: userProfile.role
            },
            status: 'active',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            views: 0,
            matchedWith: null
        };

        await setDoc(itemRef, item);

        return {
            success: true,
            itemId: itemRef.id,
            item
        };
    } catch (error) {
        console.error('Error creating item:', error);
        throw new Error('Failed to create item report: ' + error.message);
    }
};

/**
 * Upload item images to Cloudinary
 */
export const uploadItemImages = async (files) => {
    try {
        if (!files || files.length === 0) {
            return [];
        }

        const results = await uploadMultipleImagesDirect(files, 'lost-found/items');
        return results.map(r => r.url);
    } catch (error) {
        console.error('Error uploading item images:', error);
        throw new Error('Failed to upload images: ' + error.message);
    }
};

/**
 * Get items with optional filters
 */
export const getItems = async (filters = {}) => {
    try {
        const itemsRef = collection(db, ITEMS_COLLECTION);
        let q = query(itemsRef);

        // Apply filters
        if (filters.type) {
            q = query(q, where('type', '==', filters.type));
        }
        if (filters.status) {
            q = query(q, where('status', '==', filters.status));
        }
        if (filters.category) {
            q = query(q, where('category', '==', filters.category));
        }
        if (filters.reportedBy) {
            q = query(q, where('reportedBy.uid', '==', filters.reportedBy));
        }

        // Order by creation date (newest first)
        // We try to use DB sorting first, but fallback to client-side if index is missing
        let qOptimized = query(q, orderBy('createdAt', 'desc'));

        // Limit results
        if (filters.limit) {
            qOptimized = query(qOptimized, limit(filters.limit));
            q = query(q, limit(filters.limit));
        }

        let querySnapshot;
        let sortedByDb = true;

        try {
            // Try to execute the optimized query
            querySnapshot = await getDocs(qOptimized);
        } catch (err) {
            // Check if error is due to missing index
            if (err.code === 'failed-precondition') {
                console.warn('Firestore index missing. Falling back to client-side sorting. Please create the index using the link in the error message:', err.message);
                // Fallback to original query without orderBy
                querySnapshot = await getDocs(q);
                sortedByDb = false;
            } else {
                throw err;
            }
        }

        const items = [];

        querySnapshot.forEach((doc) => {
            items.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Sort in memory only if DB sort failed
        if (!sortedByDb) {
            items.sort((a, b) => {
                const aTime = a.createdAt?.toDate?.() || new Date(0);
                const bTime = b.createdAt?.toDate?.() || new Date(0);
                return bTime - aTime;
            });
        }

        return items;
    } catch (error) {
        console.error('Error fetching items:', error);
        throw new Error('Failed to fetch items');
    }
};

/**
 * Get single item by ID
 */
export const getItemById = async (itemId) => {
    try {
        const itemRef = doc(db, ITEMS_COLLECTION, itemId);
        const itemDoc = await getDoc(itemRef);

        if (itemDoc.exists()) {
            return {
                id: itemDoc.id,
                ...itemDoc.data()
            };
        }

        return null;
    } catch (error) {
        console.error('Error fetching item:', error);
        throw new Error('Failed to fetch item');
    }
};

/**
 * Update item status
 */
export const updateItemStatus = async (itemId, status) => {
    try {
        const itemRef = doc(db, ITEMS_COLLECTION, itemId);

        await updateDoc(itemRef, {
            status,
            updatedAt: serverTimestamp()
        });

        return { success: true };
    } catch (error) {
        console.error('Error updating item status:', error);
        throw new Error('Failed to update item status');
    }
};

/**
 * Increment item view count
 */
export const incrementItemViews = async (itemId) => {
    try {
        const itemRef = doc(db, ITEMS_COLLECTION, itemId);
        const itemDoc = await getDoc(itemRef);

        if (itemDoc.exists()) {
            const currentViews = itemDoc.data().views || 0;
            await updateDoc(itemRef, {
                views: currentViews + 1
            });
        }
    } catch (error) {
        console.error('Error incrementing views:', error);
    }
};

export default {
    createItem,
    uploadItemImages,
    getItems,
    getItemById,
    updateItemStatus,
    incrementItemViews
};
