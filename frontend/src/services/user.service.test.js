import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkIdentifierExists } from './user.service';
import * as firestore from 'firebase/firestore';

// Mock dependencies
vi.mock('../config/firebase', () => ({
    db: {},
    auth: {}
}));

vi.mock('./cloudinary.service', () => ({
    uploadImageDirect: vi.fn()
}));

vi.mock('./otp.service', () => ({
    sendEmailOTP: vi.fn(),
    sendMobileOTP: vi.fn()
}));

vi.mock('firebase/auth', () => ({
    signInWithEmailAndPassword: vi.fn()
}));

// Mock Firestore
vi.mock('firebase/firestore', async () => {
    return {
        collection: vi.fn(),
        query: vi.fn(),
        where: vi.fn(),
        getDocs: vi.fn(),
        getCountFromServer: vi.fn(),
        doc: vi.fn(),
        getDoc: vi.fn(),
        setDoc: vi.fn(),
        updateDoc: vi.fn(),
        serverTimestamp: vi.fn()
    };
});

describe('User Service Performance Benchmark', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should use getCountFromServer (efficient)', async () => {
        // Setup mock return for getCountFromServer
        const mockSnapshot = {
            data: () => ({ count: 1 })
        };
        firestore.getCountFromServer.mockResolvedValue(mockSnapshot);

        const exists = await checkIdentifierExists('test-id', 'student');

        expect(firestore.getCountFromServer).toHaveBeenCalled();
        expect(firestore.getDocs).not.toHaveBeenCalled();
        expect(exists).toBe(true);
    });
});
