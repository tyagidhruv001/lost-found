import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../config/firebase.config';

// Validation: Check if API keys are configured
const isConfigured = firebaseConfig.apiKey &&
                    !firebaseConfig.apiKey.includes('your-api-key') &&
                    !firebaseConfig.apiKey.includes('your_firebase_api_key');

if (!isConfigured) {
    console.error(
        '%c⚠️ FIREBASE NOT CONFIGURED',
        'font-weight: bold; font-size: 20px; color: red;'
    );
    console.error(
        'Please update frontend/.env with your Firebase credentials.\n' +
        'See frontend/README.md for instructions.'
    );
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
