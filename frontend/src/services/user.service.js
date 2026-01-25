import {
    collection,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    query,
    where,
    getDocs,
    getCountFromServer,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { uploadImageDirect } from './cloudinary.service';
import { sendEmailOTP, sendMobileOTP } from './otp.service';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

// Helper to generate a consistent system password
// In a real production app, you'd use Custom Auth Tokens
export const generateSystemPassword = (identifier) => {
    const cleanId = identifier.trim().replace(/[^a-zA-Z0-9]/g, '');
    return `Auth@${cleanId}#2026`;
};


// Collections
const COLLECTIONS = {
    USERS: 'users',
    VERIFICATION_REQUESTS: 'verification_requests',
    OTP_SESSIONS: 'otp_sessions'
};

/**
 * Create user profile in Firestore
 */
export const createUserProfile = async (userId, userData) => {
    try {
        const userRef = doc(db, COLLECTIONS.USERS, userId);

        const profileData = {
            uid: userId,
            emailVerified: false,
            mobileVerified: false,
            documentVerified: false,
            approvalStatus: 'pending',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastLogin: null,
            ...userData // userData should override defaults (like verified status)
        };

        await setDoc(userRef, profileData);

        return { success: true };
    } catch (error) {
        throw new Error('Failed to create user profile: ' + error.message);
    }
};

/**
 * Upload ID card and profile photo
 */
export const uploadUserDocuments = async (userId, idCardFile, profilePhotoFile) => {
    try {
        const uploads = {};

        // Upload ID card
        if (idCardFile) {
            const idCardResult = await uploadImageDirect(
                idCardFile,
                `users/${userId}/documents`
            );
            uploads.idCardUrl = idCardResult.url;
            uploads.idCardPublicId = idCardResult.publicId;
        }

        // Upload profile photo
        if (profilePhotoFile) {
            const profileResult = await uploadImageDirect(
                profilePhotoFile,
                `users/${userId}/profile`
            );
            uploads.profilePhotoUrl = profileResult.url;
            uploads.profilePhotoPublicId = profileResult.publicId;
        }

        // Update user document with image URLs
        const userRef = doc(db, COLLECTIONS.USERS, userId);
        await updateDoc(userRef, {
            ...uploads,
            updatedAt: serverTimestamp()
        });

        return uploads;
    } catch (error) {
        console.error('Error uploading documents:', error);
        throw new Error('Failed to upload documents');
    }
};

/**
 * Generate and send OTP
 */
export const sendOTP = async (userId, type, contact, name = 'User') => {
    try {
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP session
        const sessionRef = doc(collection(db, COLLECTIONS.OTP_SESSIONS));
        const sessionData = {
            userId,
            type, // can be a string 'email'/'mobile' or an array ['email', 'mobile']
            contact, // can be a single contact or an object {email: '...', mobile: '...'}
            otpHash: hashOTP(otp),
            expiresAt: new Date(Date.now() + 60 * 1000), // 60 seconds
            verified: false,
            attempts: 0,
            createdAt: serverTimestamp()
        };

        await setDoc(sessionRef, sessionData);

        // Send OTP to requested channels
        const channels = Array.isArray(type) ? type : [type];

        for (const channel of channels) {
            const targetContact = typeof contact === 'object' ? contact[channel] : contact;
            if (channel === 'email') {
                await sendEmailOTPHelper(targetContact, otp, name);
            } else if (channel === 'mobile') {
                await sendMobileOTPHelper(targetContact, otp, name);
            }
        }

        return {
            success: true,
            sessionId: sessionRef.id,
            expiresIn: 60
        };
    } catch (error) {
        console.error('Error sending OTP:', error);
        throw new Error('Failed to send OTP: ' + error.message);
    }
};

/**
 * Verify OTP
 */
export const verifyOTP = async (sessionId, otp) => {
    try {
        const sessionRef = doc(db, COLLECTIONS.OTP_SESSIONS, sessionId);
        const sessionDoc = await getDoc(sessionRef);

        if (!sessionDoc.exists()) {
            throw new Error('Invalid session');
        }

        const sessionData = sessionDoc.data();

        // Check expiration
        if (sessionData.expiresAt.toDate() < new Date()) {
            throw new Error('OTP expired');
        }

        // Check attempts
        if (sessionData.attempts >= 3) {
            throw new Error('Too many attempts');
        }

        // Verify OTP
        const isValid = sessionData.otpHash === hashOTP(otp);

        if (isValid) {
            await updateDoc(sessionRef, {
                verified: true,
                verifiedAt: serverTimestamp()
            });

            return { success: true, verified: true };
        } else {
            // Increment attempts
            await updateDoc(sessionRef, {
                attempts: sessionData.attempts + 1
            });

            throw new Error('Invalid OTP');
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        throw error;
    }
};

/**
 * Create verification request with document data
 */
export const createVerificationRequest = async (userId, submittedData, idCardUrl) => {
    try {
        const requestRef = doc(collection(db, COLLECTIONS.VERIFICATION_REQUESTS));

        await setDoc(requestRef, {
            userId,
            type: submittedData.role,
            submittedData: {
                name: submittedData.name,
                dateOfBirth: submittedData.dateOfBirth,
                identifier: submittedData.identifier,
                email: submittedData.email,
                mobile: submittedData.mobile
            },
            idCardUrl,
            extractedData: null, // Will be filled by OCR
            conflicts: [],
            status: 'pending',
            reviewedBy: null,
            reviewNotes: null,
            createdAt: serverTimestamp()
        });

        return { success: true, requestId: requestRef.id };
    } catch (error) {
        console.error('Error creating verification request:', error);
        throw new Error('Failed to create verification request');
    }
};

/**
 * Get user profile
 */
export const getUserProfile = async (userId) => {
    try {
        const userRef = doc(db, COLLECTIONS.USERS, userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            return userDoc.data();
        }

        return null;
    } catch (error) {
        console.error('Error getting user profile:', error);
        throw new Error('Failed to get user profile');
    }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, updates) => {
    try {
        const userRef = doc(db, COLLECTIONS.USERS, userId);

        await updateDoc(userRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });

        return { success: true };
    } catch (error) {
        console.error('Error updating profile:', error);
        throw new Error('Failed to update profile');
    }
};

/**
 * Check if identifier is already registered
 */
export const checkIdentifierExists = async (identifier, role) => {
    try {
        const usersRef = collection(db, COLLECTIONS.USERS);
        const q = query(
            usersRef,
            where('identifier', '==', identifier),
            where('role', '==', role)
        );

        const snapshot = await getCountFromServer(q);
        return snapshot.data().count > 0;
    } catch (error) {
        console.error('Error checking identifier:', error);
        return false;
    }
};

// Helper functions
const hashOTP = (otp) => {
    // Simple hash - in production use crypto.subtle or similar
    return btoa(otp + 'salt_key_2024');
};

const sendEmailOTPHelper = async (email, otp, name) => {
    const result = await sendEmailOTP(email, otp, name);
    return result;
};

const sendMobileOTPHelper = async (mobile, otp) => {
    const result = await sendMobileOTP(mobile, otp);
    return result;
};

/**
 * Verify if user exists with matching identifier and mobile
 */
export const verifyUserContact = async (identifier, mobile, role) => {
    try {
        const usersRef = collection(db, COLLECTIONS.USERS);
        // Query by identifier (Roll No/Faculty ID) and Role
        // We match strictly to ensure security
        const q = query(
            usersRef,
            where('identifier', '==', identifier),
            where('role', '==', role)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { exists: false, error: 'User not found' };
        }

        const userData = querySnapshot.docs[0].data();

        // Check if mobile matches (last 10 digits to be safe)
        if (userData.mobile !== mobile) {
            return { exists: false, error: 'Mobile number does not match our records' };
        }

        return {
            exists: true,
            userId: userData.uid,
            email: userData.email, // This is the primary auth email (now personalEmail)
            universityEmail: userData.universityEmail,
            personalEmail: userData.personalEmail,
            name: userData.name
        };
    } catch (error) {
        console.error('Error verifying contact:', error);
        throw new Error('Verification failed');
    }
};

/**
 * Perform System Login after OTP Verification
 */
export const loginWithSystemPassword = async (email, identifier) => {
    try {
        const password = generateSystemPassword(identifier);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('System Login Error:', error);
        throw error;
    }
}

export default {
    createUserProfile,
    uploadUserDocuments,
    sendOTP,
    verifyOTP,
    createVerificationRequest,
    getUserProfile,
    updateUserProfile,
    checkIdentifierExists,
    verifyUserContact,
    loginWithSystemPassword,
    generateSystemPassword
};

