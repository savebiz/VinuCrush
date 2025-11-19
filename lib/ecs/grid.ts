/**
 * ECS Grid - Core game state using Uint8Array
 * NO CLASSES - Strictly functional approach
 * 
 * Grid: 9x9 = 81 cells
 * Index formula: i = y * 9 + x
 */

const GRID_SIZE = 9;
const GRID_TOTAL = 81; // 9 * 9

/**
 * Grid structure - two Uint8Array buffers
 */
export interface Grid {
  Types: Uint8Array;   // Tile colors (0-5) or 255 for empty
  Status: Uint8Array;  // Bitmask flags
}

/**
 * Status flags (bitmask)
 */
export const STATUS_MATCH = 1;   // 0b001
export const STATUS_FALLING = 2; // 0b010
export const STATUS_ICE = 4;     // 0b100

/**
 * Create a new grid with empty Uint8Array buffers
 */
export function createGrid(): Grid {
  return {
    Types: new Uint8Array(GRID_TOTAL),
    Status: new Uint8Array(GRID_TOTAL),
  };
}

/**
 * Convert 2D coordinates to 1D index
 */
export function getIndex(x: number, y: number): number {
  return y * GRID_SIZE + x;
}

/**
 * Convert 1D index to 2D coordinates
 */
export function getXY(index: number): { x: number; y: number } {
  return {
    x: index % GRID_SIZE,
    y: Math.floor(index / GRID_SIZE),
  };
}

/**
 * Check for matches and flag them in Status array
 * Uses iterative scan - NO RECURSION
 * Returns number of tiles matched
 */
export function checkMatches(grid: Grid): number {
  let matchCount = 0;

  // Clear all match flags first
  for (let i = 0; i < GRID_TOTAL; i++) {
    grid.Status[i] &= ~STATUS_MATCH;
  }

  // Horizontal scan
  for (let y = 0; y < GRID_SIZE; y++) {
    let matchStart = 0;
    let currentColor = grid.Types[getIndex(0, y)];

    for (let x = 1; x <= GRID_SIZE; x++) {
      const index = x < GRID_SIZE ? getIndex(x, y) : -1;
      const color = index >= 0 ? grid.Types[index] : 255;

      // Check if match continues
      if (color === currentColor && color !== 255 && color !== 0) {
        continue;
      }

      // Match ended - check if we have 3+
      const matchLength = x - matchStart;
      if (matchLength >= 3 && currentColor !== 255 && currentColor !== 0) {
        // Flag all tiles in this match
        for (let mx = matchStart; mx < x; mx++) {
          const matchIndex = getIndex(mx, y);
          grid.Status[matchIndex] |= STATUS_MATCH;
          matchCount++;
        }
      }

      // Start new potential match
      matchStart = x;
      currentColor = color;
    }
  }

  // Vertical scan
  for (let x = 0; x < GRID_SIZE; x++) {
    let matchStart = 0;
    let currentColor = grid.Types[getIndex(x, 0)];

    for (let y = 1; y <= GRID_SIZE; y++) {
      const index = y < GRID_SIZE ? getIndex(x, y) : -1;
      const color = index >= 0 ? grid.Types[index] : 255;

      // Check if match continues
      if (color === currentColor && color !== 255 && color !== 0) {
        continue;
      }

      // Match ended - check if we have 3+
      const matchLength = y - matchStart;
      if (matchLength >= 3 && currentColor !== 255 && currentColor !== 0) {
        // Flag all tiles in this match
        for (let my = matchStart; my < y; my++) {
          const matchIndex = getIndex(x, my);
          grid.Status[matchIndex] |= STATUS_MATCH;
          matchCount++;
        }
      }

      // Start new potential match
      matchStart = y;
      currentColor = color;
    }
  }

  return matchCount;
}

/**
 * Apply gravity - shift non-zero values down into zero slots
 * Processes column by column from bottom to top
 * Returns true if any tiles moved
 */
export function applyGravity(grid: Grid): boolean {
  let moved = false;

  // Process each column
  for (let x = 0; x < GRID_SIZE; x++) {
    // Write pointer starts at bottom
    let writeY = GRID_SIZE - 1;

    // Scan from bottom to top
    for (let readY = GRID_SIZE - 1; readY >= 0; readY--) {
      const readIndex = getIndex(x, readY);
      const value = grid.Types[readIndex];

      // If non-zero, write it to the write position
      if (value !== 0 && value !== 255) {
        if (readY !== writeY) {
          const writeIndex = getIndex(x, writeY);
          grid.Types[writeIndex] = value;
          grid.Types[readIndex] = 0;
          moved = true;
        }
        writeY--;
      }
    }
  }

  return moved;
}

/**
 * Export constants
 */
export { GRID_SIZE, GRID_TOTAL };
