import { describe, it, expect, vi, beforeEach } from 'vitest';
import { incrementItemViews } from './items.service';
import * as firestore from 'firebase/firestore';

// Mock firebase/firestore
vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    doc: vi.fn(),
    getDoc: vi.fn(),
    updateDoc: vi.fn(),
    increment: vi.fn((n) => ({ type: 'increment', value: n })),
    collection: vi.fn(),
    setDoc: vi.fn(),
    getDocs: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    serverTimestamp: vi.fn(),
  };
});

// Mock ../config/firebase
vi.mock('../config/firebase', () => ({
  db: {},
}));

// Mock cloudinary.service
vi.mock('./cloudinary.service', () => ({
  uploadMultipleImagesDirect: vi.fn(),
}));

describe('incrementItemViews', () => {
  const itemId = 'test-item-id';
  const mockDocRef = { id: itemId };

  beforeEach(() => {
    vi.clearAllMocks();
    firestore.doc.mockReturnValue(mockDocRef);
  });

  it('should increment views atomically using updateDoc and increment', async () => {
    await incrementItemViews(itemId);

    // Verify NO read
    expect(firestore.getDoc).not.toHaveBeenCalled();

    // Verify write with increment(1)
    expect(firestore.updateDoc).toHaveBeenCalledWith(mockDocRef, {
      views: { type: 'increment', value: 1 } // Matching the mock implementation
    });

    // Verify increment was called
    expect(firestore.increment).toHaveBeenCalledWith(1);
  });

  it('should handle errors gracefully (e.g., document not found)', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Simulate updateDoc failure
    const error = new Error('No document to update');
    firestore.updateDoc.mockRejectedValue(error);

    await incrementItemViews(itemId);

    expect(firestore.updateDoc).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Error incrementing views:', error);

    consoleSpy.mockRestore();
  });
});
