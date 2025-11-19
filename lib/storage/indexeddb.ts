/**
 * IndexedDB wrapper for storing game state and move history
 */

const DB_NAME = 'VinuCrushDB';
const DB_VERSION = 1;
const STORE_NAME = 'gameHistory';

export interface Move {
    from: { x: number; y: number };
    to: { x: number; y: number };
    timestamp: number;
}

export interface GameHistory {
    level: number;
    moves: Move[];
    completed: boolean;
    score: number;
    timestamp: number;
}

/**
 * Initialize the IndexedDB database
 */
function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;

            // Create object store if it doesn't exist
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'level' });
                objectStore.createIndex('timestamp', 'timestamp', { unique: false });
                objectStore.createIndex('completed', 'completed', { unique: false });
            }
        };
    });
}

/**
 * Save game history for a level
 */
export async function saveGameHistory(history: GameHistory): Promise<void> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(history);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}

/**
 * Get game history for a specific level
 */
export async function getGameHistory(level: number): Promise<GameHistory | null> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(level);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result || null);
    });
}

/**
 * Get all game history
 */
export async function getAllGameHistory(): Promise<GameHistory[]> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result || []);
    });
}

/**
 * Delete game history for a specific level
 */
export async function deleteGameHistory(level: number): Promise<void> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(level);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}

/**
 * Clear all game history
 */
export async function clearAllGameHistory(): Promise<void> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}

/**
 * Get the highest completed level
 */
export async function getHighestCompletedLevel(): Promise<number> {
    const allHistory = await getAllGameHistory();
    const completedLevels = allHistory
        .filter((h) => h.completed)
        .map((h) => h.level);

    return completedLevels.length > 0 ? Math.max(...completedLevels) : 0;
}
