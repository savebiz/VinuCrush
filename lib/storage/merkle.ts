/**
 * Merkle Tree utilities for hashing move history
 * Used to create verifiable proofs of game progress
 */

/**
 * Simple hash function (SHA-256 via Web Crypto API)
 */
async function sha256(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash a single move
 */
export async function hashMove(move: {
    from: { x: number; y: number };
    to: { x: number; y: number };
    timestamp: number;
}): Promise<string> {
    const moveString = `${move.from.x},${move.from.y}->${move.to.x},${move.to.y}@${move.timestamp}`;
    return sha256(moveString);
}

/**
 * Create a Merkle root from an array of move hashes
 */
export async function createMerkleRoot(moveHashes: string[]): Promise<string> {
    if (moveHashes.length === 0) {
        return sha256('empty');
    }

    if (moveHashes.length === 1) {
        return moveHashes[0];
    }

    // Build the tree bottom-up
    let currentLevel = moveHashes;

    while (currentLevel.length > 1) {
        const nextLevel: string[] = [];

        for (let i = 0; i < currentLevel.length; i += 2) {
            if (i + 1 < currentLevel.length) {
                // Hash pair
                const combined = currentLevel[i] + currentLevel[i + 1];
                nextLevel.push(await sha256(combined));
            } else {
                // Odd number, carry forward
                nextLevel.push(currentLevel[i]);
            }
        }

        currentLevel = nextLevel;
    }

    return currentLevel[0];
}

/**
 * Hash an entire move history and return the Merkle root
 */
export async function hashMoveHistory(moves: Array<{
    from: { x: number; y: number };
    to: { x: number; y: number };
    timestamp: number;
}>): Promise<string> {
    const moveHashes = await Promise.all(moves.map(hashMove));
    return createMerkleRoot(moveHashes);
}

/**
 * Convert hex hash to bytes32 format for Solidity
 */
export function hexToBytes32(hex: string): `0x${string}` {
    // Ensure it's 64 characters (32 bytes)
    const paddedHex = hex.padStart(64, '0');
    return `0x${paddedHex}`;
}
