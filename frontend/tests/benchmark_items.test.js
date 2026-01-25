import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies BEFORE importing the service
vi.mock('../src/config/firebase', () => ({
  db: {}
}));

const mockGetDocs = vi.fn();
const mockQuery = vi.fn();
const mockCollection = vi.fn();
const mockWhere = vi.fn();
const mockOrderBy = vi.fn();
const mockLimit = vi.fn();

vi.mock('firebase/firestore', () => ({
  collection: (...args) => mockCollection(...args),
  query: (...args) => mockQuery(...args),
  where: (...args) => mockWhere(...args),
  orderBy: (...args) => mockOrderBy(...args),
  limit: (...args) => mockLimit(...args),
  getDocs: (...args) => mockGetDocs(...args),
  doc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  updateDoc: vi.fn(),
  serverTimestamp: vi.fn()
}));

vi.mock('../src/services/cloudinary.service', () => ({
  uploadMultipleImagesDirect: vi.fn()
}));

import { getItems } from '../src/services/items.service';

describe('Items Service Benchmark', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mocks
    mockQuery.mockReturnValue({});
    mockCollection.mockReturnValue({});
  });

  const generateItems = (count, sorted = false) => {
    const items = [];
    for (let i = 0; i < count; i++) {
        const timeOffset = sorted ? i * 1000 : Math.floor(Math.random() * 10000000);
        const fixedDate = new Date(Date.now() - timeOffset);
        items.push({
            id: `item-${i}`,
            createdAt: { toDate: () => fixedDate },
            title: `Item ${i}`
        });
    }
    if (!sorted) {
        // Shuffle
        items.sort(() => Math.random() - 0.5);
    }
    return items;
  };

  it('Measure Fallback Path (Client Sort when Index Missing)', async () => {
    const items = generateItems(5000, false);

    // First call throws failed-precondition
    mockGetDocs.mockRejectedValueOnce({ code: 'failed-precondition', message: 'Index missing...' });
    // Second call returns unsorted items
    mockGetDocs.mockResolvedValueOnce({
      forEach: (cb) => items.forEach(item => cb({ id: item.id, data: () => item }))
    });

    const start = performance.now();
    const result = await getItems();
    const end = performance.now();

    console.log(`Fallback (Client Sort) Execution Time: ${(end - start).toFixed(2)}ms`);

    // Verify it tried twice
    expect(mockGetDocs).toHaveBeenCalledTimes(2);
    // Verify sorted result
    for (let i = 0; i < result.length - 1; i++) {
        const timeA = result[i].createdAt.toDate().getTime();
        const timeB = result[i+1].createdAt.toDate().getTime();
        expect(timeA).toBeGreaterThanOrEqual(timeB);
    }
  });

  it('Measure Optimized Path (DB Sort)', async () => {
    const items = generateItems(5000, true); // DB returns sorted

    // First call succeeds
    mockGetDocs.mockResolvedValueOnce({
      forEach: (cb) => items.forEach(item => cb({ id: item.id, data: () => item }))
    });

    const start = performance.now();
    const result = await getItems();
    const end = performance.now();

    console.log(`Optimized (DB Sort) Execution Time: ${(end - start).toFixed(2)}ms`);

    // Verify called once and used orderBy
    expect(mockGetDocs).toHaveBeenCalledTimes(1);
    expect(mockOrderBy).toHaveBeenCalledWith('createdAt', 'desc');

    // Verify sorted result
    for (let i = 0; i < result.length - 1; i++) {
        const timeA = result[i].createdAt.toDate().getTime();
        const timeB = result[i+1].createdAt.toDate().getTime();
        expect(timeA).toBeGreaterThanOrEqual(timeB);
    }
  });
});
