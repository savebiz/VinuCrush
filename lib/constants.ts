/**
 * Game Constants
 * Tile types, assets, and configuration
 */

export enum TileType {
    RED = 'RED',
    BLUE = 'BLUE',
    GREEN = 'GREEN',
    YELLOW = 'YELLOW',
    PURPLE = 'PURPLE',
    INGREDIENT = 'INGREDIENT',
}

/**
 * Tile asset URLs
 * Using data URIs for colored gem SVGs with gradients
 */
export const TILE_ASSETS: Record<TileType, string> = {
    [TileType.RED]: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Cdefs%3E%3ClinearGradient id="red" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:rgb(239,68,68);stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:rgb(185,28,28);stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Cpolygon points="50,10 90,35 90,65 50,90 10,65 10,35" fill="url(%23red)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/%3E%3Cellipse cx="50" cy="40" rx="20" ry="15" fill="rgba(255,255,255,0.4)"/%3E%3C/svg%3E',

    [TileType.BLUE]: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Cdefs%3E%3ClinearGradient id="blue" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:rgb(59,130,246);stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:rgb(29,78,216);stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Cpolygon points="50,10 90,35 90,65 50,90 10,65 10,35" fill="url(%23blue)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/%3E%3Cellipse cx="50" cy="40" rx="20" ry="15" fill="rgba(255,255,255,0.4)"/%3E%3C/svg%3E',

    [TileType.GREEN]: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Cdefs%3E%3ClinearGradient id="green" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:rgb(34,197,94);stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:rgb(21,128,61);stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Cpolygon points="50,10 90,35 90,65 50,90 10,65 10,35" fill="url(%23green)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/%3E%3Cellipse cx="50" cy="40" rx="20" ry="15" fill="rgba(255,255,255,0.4)"/%3E%3C/svg%3E',

    [TileType.YELLOW]: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Cdefs%3E%3ClinearGradient id="yellow" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:rgb(250,204,21);stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:rgb(202,138,4);stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Cpolygon points="50,10 90,35 90,65 50,90 10,65 10,35" fill="url(%23yellow)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/%3E%3Cellipse cx="50" cy="40" rx="20" ry="15" fill="rgba(255,255,255,0.4)"/%3E%3C/svg%3E',

    [TileType.PURPLE]: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Cdefs%3E%3ClinearGradient id="purple" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:rgb(168,85,247);stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:rgb(126,34,206);stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Cpolygon points="50,10 90,35 90,65 50,90 10,65 10,35" fill="url(%23purple)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/%3E%3Cellipse cx="50" cy="40" rx="20" ry="15" fill="rgba(255,255,255,0.4)"/%3E%3C/svg%3E',

    [TileType.INGREDIENT]: 'https://raw.githubusercontent.com/VitaInuOfficial/VinuChain-Brand-Assets/main/logos/vinuchain-logo-icon.svg',
};

/**
 * Game configuration
 */
export const GAME_CONFIG = {
    GRID_SIZE: 8,
    GRID_TOTAL: 64,
    INGREDIENT_SPAWN_CHANCE: 0.02, // 2%
    MIN_MATCH_LENGTH: 3,
} as const;

/**
 * Level configurations
 */
export const LEVELS = [
    {
        level: 1,
        targetIngredients: 1,
        moves: 15,
        name: 'Tutorial',
    },
    {
        level: 2,
        targetIngredients: 3,
        moves: 20,
        name: 'Getting Started',
    },
    {
        level: 3,
        targetIngredients: 5,
        moves: 25,
        name: 'Warming Up',
    },
    {
        level: 4,
        targetIngredients: 7,
        moves: 30,
        name: 'Challenge',
    },
    {
        level: 5,
        targetIngredients: 10,
        moves: 35,
        name: 'Expert',
    },
] as const;

/**
 * Get level config by level number
 */
export function getLevelConfig(level: number) {
    const index = Math.min(level - 1, LEVELS.length - 1);
    return LEVELS[Math.max(0, index)];
}
