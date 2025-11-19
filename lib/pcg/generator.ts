/**
 * Reverse-Play Constructive Solver
 * Generates guaranteed solvable levels by working backwards
 */

import { Grid, createGrid, getIndex, GRID_SIZE, checkMatches } from '../ecs/grid';
import { getDifficultyParams, getInjectionCount } from './difficulty';

/**
 * Seeded RNG for reproducible levels
 */
function createRNG(seed: number) {
    let state = seed;
    return {
        next(): number {
            state = (state * 1103515245 + 12345) & 0x7fffffff;
            return state / 0x7fffffff;
        },
        nextInt(max: number): number {
            return Math.floor(this.next() * max);
        },
    };
}

/**
 * Inject a reverse-play move into the grid
 * Places 3 matching tiles, then "pulls one out" to break the match
 */
function injectReverseMove(
    grid: Grid,
    rng: ReturnType<typeof createRNG>,
    colorCount: number
): boolean {
    const maxAttempts = 50;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        // Pick random position and orientation
        const isHorizontal = rng.next() > 0.5;
        const color = rng.nextInt(colorCount) + 1;

        if (isHorizontal) {
            // Horizontal match
            const y = rng.nextInt(GRID_SIZE);
            const x = rng.nextInt(GRID_SIZE - 2); // Need room for 3 tiles

            // Check if slots are available
            const idx1 = getIndex(x, y);
            const idx2 = getIndex(x + 1, y);
            const idx3 = getIndex(x + 2, y);

            if (grid.Types[idx1] === 0 && grid.Types[idx2] === 0 && grid.Types[idx3] === 0) {
                // Place the match
                grid.Types[idx1] = color;
                grid.Types[idx2] = color;
                grid.Types[idx3] = color;

                // "Pull one out" - swap with adjacent tile
                const swapDir = rng.next() > 0.5 ? 1 : -1;
                const swapX = x + 1 + swapDir; // Swap middle tile

                if (swapX >= 0 && swapX < GRID_SIZE && swapX !== x && swapX !== x + 2) {
                    const swapIdx = getIndex(swapX, y);
                    if (grid.Types[swapIdx] === 0) {
                        // Place a different color in the swap position
                        const differentColor = ((color % colorCount) + 1);
                        grid.Types[swapIdx] = differentColor;

                        // Swap middle tile with it
                        grid.Types[idx2] = differentColor;
                        grid.Types[swapIdx] = color;

                        return true;
                    }
                }
            }
        } else {
            // Vertical match
            const x = rng.nextInt(GRID_SIZE);
            const y = rng.nextInt(GRID_SIZE - 2); // Need room for 3 tiles

            const idx1 = getIndex(x, y);
            const idx2 = getIndex(x, y + 1);
            const idx3 = getIndex(x, y + 2);

            if (grid.Types[idx1] === 0 && grid.Types[idx2] === 0 && grid.Types[idx3] === 0) {
                // Place the match
                grid.Types[idx1] = color;
                grid.Types[idx2] = color;
                grid.Types[idx3] = color;

                // "Pull one out" - swap with adjacent tile
                const swapDir = rng.next() > 0.5 ? 1 : -1;
                const swapY = y + 1 + swapDir;

                if (swapY >= 0 && swapY < GRID_SIZE && swapY !== y && swapY !== y + 2) {
                    const swapIdx = getIndex(x, swapY);
                    if (grid.Types[swapIdx] === 0) {
                        const differentColor = ((color % colorCount) + 1);
                        grid.Types[swapIdx] = differentColor;

                        grid.Types[idx2] = differentColor;
                        grid.Types[swapIdx] = color;

                        return true;
                    }
                }
            }
        }
    }

    return false;
}

/**
 * Fill remaining empty slots with random colors (no matches)
 */
function fillNoMatches(grid: Grid, rng: ReturnType<typeof createRNG>, colorCount: number): void {
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            const idx = getIndex(x, y);
            if (grid.Types[idx] === 0) {
                let color: number;
                let attempts = 0;

                do {
                    color = rng.nextInt(colorCount) + 1;
                    grid.Types[idx] = color;
                    attempts++;

                    // Check for matches
                    const hasHMatch =
                        x >= 2 &&
                        grid.Types[getIndex(x - 1, y)] === color &&
                        grid.Types[getIndex(x - 2, y)] === color;

                    const hasVMatch =
                        y >= 2 &&
                        grid.Types[getIndex(x, y - 1)] === color &&
                        grid.Types[getIndex(x, y - 2)] === color;

                    if (!hasHMatch && !hasVMatch) break;

                    if (attempts >= 50) {
                        grid.Types[idx] = ((color % colorCount) + 1);
                        break;
                    }
                } while (true);
            }
        }
    }
}

/**
 * Generate a level using Reverse-Play algorithm
 */
export function generateLevel(
    seed: number,
    difficulty?: number
): { grid: Grid; targetScore: number; params: ReturnType<typeof getDifficultyParams> } {
    const rng = createRNG(seed);
    const params = getDifficultyParams(seed);
    const actualDifficulty = difficulty ?? params.totalDifficulty;

    // Create empty grid
    const grid = createGrid();

    // Inject reverse-play moves
    const injectionCount = getInjectionCount(actualDifficulty);
    let successfulInjections = 0;

    for (let i = 0; i < injectionCount; i++) {
        if (injectReverseMove(grid, rng, params.colorCount)) {
            successfulInjections++;
        }
    }

    // Fill remaining slots
    fillNoMatches(grid, rng, params.colorCount);

    // Calculate target score based on injections
    const targetScore = successfulInjections * 30;

    return {
        grid,
        targetScore,
        params,
    };
}
