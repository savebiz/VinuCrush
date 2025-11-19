/**
 * useGameLogic Hook
 * Core game logic for 8x8 Match-3 with ingredient collection
 * Uses UUID-based tiles for proper tracking through gravity
 */

'use client';

import { useState, useCallback } from 'react';
import { TileType, GAME_CONFIG, getLevelConfig } from '@/lib/constants';
import { generateUUID, randomElement } from '@/lib/utils';

export interface Tile {
    id: string; // UUID - persists through gravity
    type: TileType;
    x: number;
    y: number;
}

export interface GameState {
    grid: Tile[];
    level: number;
    movesLeft: number;
    score: number;
    ingredientsCollected: number;
    targetIngredients: number;
    isProcessing: boolean;
    gameStatus: 'playing' | 'won' | 'lost';
}

const REGULAR_TILES = [
    TileType.RED,
    TileType.BLUE,
    TileType.GREEN,
    TileType.YELLOW,
    TileType.PURPLE,
];

/**
 * Create a new tile
 */
function createTile(x: number, y: number, type?: TileType): Tile {
    return {
        id: generateUUID(),
        type: type || randomElement(REGULAR_TILES),
        x,
        y,
    };
}

/**
 * Initialize grid with random tiles (no matches)
 */
function initializeGrid(): Tile[] {
    const grid: Tile[] = [];

    for (let y = 0; y < GAME_CONFIG.GRID_SIZE; y++) {
        for (let x = 0; x < GAME_CONFIG.GRID_SIZE; x++) {
            let tile: Tile;
            let attempts = 0;

            do {
                tile = createTile(x, y);
                attempts++;

                // Check for horizontal match
                const hasHMatch =
                    x >= 2 &&
                    grid[y * GAME_CONFIG.GRID_SIZE + (x - 1)]?.type === tile.type &&
                    grid[y * GAME_CONFIG.GRID_SIZE + (x - 2)]?.type === tile.type;

                // Check for vertical match
                const hasVMatch =
                    y >= 2 &&
                    grid[(y - 1) * GAME_CONFIG.GRID_SIZE + x]?.type === tile.type &&
                    grid[(y - 2) * GAME_CONFIG.GRID_SIZE + x]?.type === tile.type;

                if (!hasHMatch && !hasVMatch) break;
                if (attempts >= 50) break; // Fallback
            } while (true);

            grid.push(tile);
        }
    }

    return grid;
}

/**
 * Check for matches (3+ in a row)
 * Excludes INGREDIENT type
 */
function checkForMatches(grid: Tile[]): string[] {
    const matchedIds = new Set<string>();

    // Horizontal matches
    for (let y = 0; y < GAME_CONFIG.GRID_SIZE; y++) {
        for (let x = 0; x < GAME_CONFIG.GRID_SIZE - 2; x++) {
            const idx = y * GAME_CONFIG.GRID_SIZE + x;
            const tile1 = grid[idx];
            const tile2 = grid[idx + 1];
            const tile3 = grid[idx + 2];

            if (
                tile1.type === tile2.type &&
                tile2.type === tile3.type &&
                tile1.type !== TileType.INGREDIENT
            ) {
                matchedIds.add(tile1.id);
                matchedIds.add(tile2.id);
                matchedIds.add(tile3.id);

                // Check for longer matches
                let offset = 3;
                while (x + offset < GAME_CONFIG.GRID_SIZE) {
                    const nextTile = grid[idx + offset];
                    if (nextTile.type === tile1.type) {
                        matchedIds.add(nextTile.id);
                        offset++;
                    } else {
                        break;
                    }
                }
            }
        }
    }

    // Vertical matches
    for (let x = 0; x < GAME_CONFIG.GRID_SIZE; x++) {
        for (let y = 0; y < GAME_CONFIG.GRID_SIZE - 2; y++) {
            const idx = y * GAME_CONFIG.GRID_SIZE + x;
            const tile1 = grid[idx];
            const tile2 = grid[idx + GAME_CONFIG.GRID_SIZE];
            const tile3 = grid[idx + GAME_CONFIG.GRID_SIZE * 2];

            if (
                tile1.type === tile2.type &&
                tile2.type === tile3.type &&
                tile1.type !== TileType.INGREDIENT
            ) {
                matchedIds.add(tile1.id);
                matchedIds.add(tile2.id);
                matchedIds.add(tile3.id);

                // Check for longer matches
                let offset = 3;
                while (y + offset < GAME_CONFIG.GRID_SIZE) {
                    const nextTile = grid[idx + GAME_CONFIG.GRID_SIZE * offset];
                    if (nextTile.type === tile1.type) {
                        matchedIds.add(nextTile.id);
                        offset++;
                    } else {
                        break;
                    }
                }
            }
        }
    }

    return Array.from(matchedIds);
}

/**
 * Apply gravity and refill
 * Returns { newGrid, ingredientsCollected }
 */
function applyGravity(
    grid: Tile[],
    matchedIds: string[],
    level: number,
    currentIngredientsCollected: number,
    targetIngredients: number
): { newGrid: Tile[]; ingredientsCollected: number } {
    let ingredientsCollected = 0;

    // Remove matched tiles
    let newGrid = grid.filter((tile) => !matchedIds.includes(tile.id));

    // Collect ingredients at bottom row (y=7)
    const ingredientsAtBottom = newGrid.filter(
        (tile) => tile.type === TileType.INGREDIENT && tile.y === GAME_CONFIG.GRID_SIZE - 1
    );
    ingredientsCollected += ingredientsAtBottom.length;
    newGrid = newGrid.filter((tile) => !ingredientsAtBottom.find((i) => i.id === tile.id));

    // Apply gravity column by column
    for (let x = 0; x < GAME_CONFIG.GRID_SIZE; x++) {
        const columnTiles = newGrid.filter((tile) => tile.x === x).sort((a, b) => b.y - a.y);

        // Reassign y positions from bottom up
        let writeY = GAME_CONFIG.GRID_SIZE - 1;
        columnTiles.forEach((tile) => {
            tile.y = writeY;
            writeY--;
        });

        // Fill empty spaces at top
        const tilesNeeded = GAME_CONFIG.GRID_SIZE - columnTiles.length;
        for (let i = 0; i < tilesNeeded; i++) {
            const shouldSpawnIngredient =
                Math.random() < GAME_CONFIG.INGREDIENT_SPAWN_CHANCE &&
                currentIngredientsCollected + ingredientsCollected < targetIngredients;

            const newTile = createTile(
                x,
                writeY,
                shouldSpawnIngredient ? TileType.INGREDIENT : undefined
            );
            columnTiles.push(newTile);
            writeY--;
        }

        // Update grid with this column
        newGrid = newGrid.filter((tile) => tile.x !== x).concat(columnTiles);
    }

    return { newGrid, ingredientsCollected };
}

/**
 * Main game logic hook
 */
export function useGameLogic(initialLevel: number = 1) {
    const levelConfig = getLevelConfig(initialLevel);

    const [state, setState] = useState<GameState>({
        grid: initializeGrid(),
        level: initialLevel,
        movesLeft: levelConfig.moves,
        score: 0,
        ingredientsCollected: 0,
        targetIngredients: levelConfig.targetIngredients,
        isProcessing: false,
        gameStatus: 'playing',
    });

    /**
     * Attempt to swap two tiles
     */
    const attemptSwap = useCallback(
        async (sourceIndex: number, targetIndex: number): Promise<boolean> => {
            if (state.isProcessing || state.gameStatus !== 'playing') return false;

            const source = state.grid[sourceIndex];
            const target = state.grid[targetIndex];

            if (!source || !target) return false;

            // Create temporary grid with swap
            const tempGrid = [...state.grid];
            tempGrid[sourceIndex] = { ...target, x: source.x, y: source.y };
            tempGrid[targetIndex] = { ...source, x: target.x, y: target.y };

            // Check for matches
            const matches = checkForMatches(tempGrid);

            // Validate: must create matches OR move ingredient to bottom
            const isIngredientMovingDown =
                (source.type === TileType.INGREDIENT && target.y > source.y) ||
                (target.type === TileType.INGREDIENT && source.y > target.y);

            if (matches.length === 0 && !isIngredientMovingDown) {
                return false; // Invalid move
            }

            // Valid move - update state
            setState((prev) => ({
                ...prev,
                grid: tempGrid,
                movesLeft: prev.movesLeft - 1,
                isProcessing: true,
            }));

            // Process matches and gravity
            await processMatches(tempGrid);

            return true;
        },
        [state]
    );

    /**
     * Process matches and cascades
     */
    const processMatches = useCallback(
        async (grid: Tile[]) => {
            let currentGrid = grid;
            let totalScore = state.score;
            let totalIngredientsCollected = state.ingredientsCollected;

            // eslint-disable-next-line no-constant-condition
            while (true) {
                const matches = checkForMatches(currentGrid);
                if (matches.length === 0) break;

                // Add score
                totalScore += matches.length * 10;

                // Wait for match animation
                await new Promise((resolve) => setTimeout(resolve, 300));

                // Apply gravity and collect ingredients
                const { newGrid, ingredientsCollected } = applyGravity(
                    currentGrid,
                    matches,
                    state.level,
                    totalIngredientsCollected,
                    state.targetIngredients
                );

                totalIngredientsCollected += ingredientsCollected;
                currentGrid = newGrid;

                // Wait for gravity animation
                await new Promise((resolve) => setTimeout(resolve, 400));
            }

            // Check win/loss conditions
            let gameStatus: 'playing' | 'won' | 'lost' = 'playing';
            if (totalIngredientsCollected >= state.targetIngredients) {
                gameStatus = 'won';
            } else if (state.movesLeft - 1 <= 0) {
                gameStatus = 'lost';
            }

            setState((prev) => ({
                ...prev,
                grid: currentGrid,
                score: totalScore,
                ingredientsCollected: totalIngredientsCollected,
                isProcessing: false,
                gameStatus,
            }));
        },
        [state]
    );

    /**
     * Reset to next level
     */
    const nextLevel = useCallback(() => {
        const newLevel = state.level + 1;
        const levelConfig = getLevelConfig(newLevel);

        setState({
            grid: initializeGrid(),
            level: newLevel,
            movesLeft: levelConfig.moves,
            score: state.score, // Preserve total score
            ingredientsCollected: 0,
            targetIngredients: levelConfig.targetIngredients,
            isProcessing: false,
            gameStatus: 'playing',
        });
    }, [state]);

    /**
     * Retry current level
     */
    const retryLevel = useCallback(() => {
        const levelConfig = getLevelConfig(state.level);

        setState({
            grid: initializeGrid(),
            level: state.level,
            movesLeft: levelConfig.moves,
            score: 0, // Reset score on retry
            ingredientsCollected: 0,
            targetIngredients: levelConfig.targetIngredients,
            isProcessing: false,
            gameStatus: 'playing',
        });
    }, [state.level]);

    return {
        state,
        attemptSwap,
        nextLevel,
        retryLevel,
    };
}
