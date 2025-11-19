/**
 * Gravity and Refill - Functional helpers
 * Works with the Grid interface from grid.ts
 */

import { Grid, getIndex, GRID_SIZE, STATUS_FALLING } from './grid';

/**
 * Fill empty slots (0 values) with random colors (1-6)
 * Marks new tiles with FALLING flag
 * Returns number of tiles added
 */
export function fillEmpty(grid: Grid): number {
    let filled = 0;

    for (let i = 0; i < grid.Types.length; i++) {
        if (grid.Types[i] === 0) {
            // Random color 1-6 (avoiding 0 which is empty)
            grid.Types[i] = Math.floor(Math.random() * 6) + 1;
            grid.Status[i] |= STATUS_FALLING;
            filled++;
        }
    }

    return filled;
}

/**
 * Clear all FALLING flags
 */
export function clearFallingFlags(grid: Grid): void {
    for (let i = 0; i < grid.Status.length; i++) {
        grid.Status[i] &= ~STATUS_FALLING;
    }
}

/**
 * Swap two tiles in the grid
 */
export function swapTiles(
    grid: Grid,
    x1: number,
    y1: number,
    x2: number,
    y2: number
): void {
    const idx1 = getIndex(x1, y1);
    const idx2 = getIndex(x2, y2);

    const tempType = grid.Types[idx1];
    const tempStatus = grid.Status[idx1];

    grid.Types[idx1] = grid.Types[idx2];
    grid.Status[idx1] = grid.Status[idx2];

    grid.Types[idx2] = tempType;
    grid.Status[idx2] = tempStatus;
}
