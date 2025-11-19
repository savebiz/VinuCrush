/**
 * Match Detection - Functional helpers
 * Works with the Grid interface from grid.ts
 */

import { Grid, getIndex, GRID_SIZE, STATUS_MATCH } from './grid';

/**
 * Remove matched tiles (set to 0 in Types array)
 * Returns number of tiles removed
 */
export function removeMatched(grid: Grid): number {
    let removed = 0;

    for (let i = 0; i < grid.Types.length; i++) {
        if (grid.Status[i] & STATUS_MATCH) {
            grid.Types[i] = 0;
            grid.Status[i] = 0;
            removed++;
        }
    }

    return removed;
}

/**
 * Check if swapping two tiles would create a match
 * Does NOT modify the grid
 */
export function wouldCreateMatch(
    grid: Grid,
    x1: number,
    y1: number,
    x2: number,
    y2: number
): boolean {
    const idx1 = getIndex(x1, y1);
    const idx2 = getIndex(x2, y2);

    // Temporarily swap
    const temp = grid.Types[idx1];
    grid.Types[idx1] = grid.Types[idx2];
    grid.Types[idx2] = temp;

    // Check for matches at both positions
    const hasMatch = checkLocalMatch(grid, x1, y1) || checkLocalMatch(grid, x2, y2);

    // Swap back
    grid.Types[idx2] = grid.Types[idx1];
    grid.Types[idx1] = temp;

    return hasMatch;
}

/**
 * Check if a specific position is part of a match (3+ in a row)
 * Helper for wouldCreateMatch
 */
function checkLocalMatch(grid: Grid, x: number, y: number): boolean {
    const color = grid.Types[getIndex(x, y)];
    if (color === 0 || color === 255) return false;

    // Check horizontal
    let hCount = 1;
    // Count left
    for (let dx = x - 1; dx >= 0; dx--) {
        if (grid.Types[getIndex(dx, y)] === color) hCount++;
        else break;
    }
    // Count right
    for (let dx = x + 1; dx < GRID_SIZE; dx++) {
        if (grid.Types[getIndex(dx, y)] === color) hCount++;
        else break;
    }
    if (hCount >= 3) return true;

    // Check vertical
    let vCount = 1;
    // Count up
    for (let dy = y - 1; dy >= 0; dy--) {
        if (grid.Types[getIndex(x, dy)] === color) vCount++;
        else break;
    }
    // Count down
    for (let dy = y + 1; dy < GRID_SIZE; dy++) {
        if (grid.Types[getIndex(x, dy)] === color) vCount++;
        else break;
    }
    if (vCount >= 3) return true;

    return false;
}

/**
 * Get all valid moves (swaps that would create matches)
 */
export function getValidMoves(grid: Grid): Array<{
    from: { x: number; y: number };
    to: { x: number; y: number };
}> {
    const moves: Array<{ from: { x: number; y: number }; to: { x: number; y: number } }> = [];

    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            // Try right
            if (x < GRID_SIZE - 1) {
                if (wouldCreateMatch(grid, x, y, x + 1, y)) {
                    moves.push({ from: { x, y }, to: { x: x + 1, y } });
                }
            }
            // Try down
            if (y < GRID_SIZE - 1) {
                if (wouldCreateMatch(grid, x, y, x, y + 1)) {
                    moves.push({ from: { x, y }, to: { x, y: y + 1 } });
                }
            }
        }
    }

    return moves;
}
