/**
 * VinuChain Web3 Connector
 * Handles gasless transactions via backend wallet pattern
 */

import { vinuchain } from './chain';

/**
 * Submit progress to VinuChain (gasless)
 * Uses backend wallet pattern - NO user signature required
 */
export async function submitProgress(
    userAddress: string,
    level: number,
    score: number
): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
        // Create simple proof (hash of score)
        const proof = await hashScore(score, level);

        // Send to backend API route
        const response = await fetch('/api/save-progress', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userAddress,
                level,
                score,
                proof,
                timestamp: Date.now(),
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            return { success: false, error };
        }

        const data = await response.json();
        return {
            success: true,
            txHash: data.txHash,
        };
    } catch (error) {
        console.error('Failed to submit progress:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Create a simple hash proof of the score
 */
async function hashScore(score: number, level: number): Promise<string> {
    const data = `${score}-${level}-vinucrush`;
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Get user's wallet address (placeholder - will be replaced with actual wallet connection)
 */
export function getUserAddress(): string {
    // For now, generate a deterministic address based on browser fingerprint
    // In production, this would come from wallet connection
    if (typeof window === 'undefined') {
        return '0x0000000000000000000000000000000000000000';
    }

    const fingerprint = navigator.userAgent + navigator.language;
    const hash = fingerprint.split('').reduce((acc, char) => {
        return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);

    // Generate a fake Ethereum address
    const hex = Math.abs(hash).toString(16).padStart(40, '0').slice(0, 40);
    return `0x${hex}`;
}

/**
 * Check if progress should be submitted (every 5 levels)
 */
export function shouldSubmitProgress(level: number): boolean {
    return level % 5 === 0;
}

export { vinuchain };
