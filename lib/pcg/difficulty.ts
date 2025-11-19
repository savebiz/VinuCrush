/**
 * Difficulty Configuration
 * Sawtooth wave pattern with color progression
 */

export interface DifficultyParams {
    totalDifficulty: number;
    baseDifficulty: number;
    localDifficulty: number;
    cyclePosition: number;
    colorCount: number;
    targetMoves: number;
}

/**
 * Get difficulty parameters for a given level
 * Uses sawtooth wave pattern that cycles every 20 levels
 */
export function getDifficultyParams(levelIndex: number): DifficultyParams {
    // Sawtooth formula
    const cyclePosition = levelIndex % 20;
    const baseDifficulty = Math.floor(levelIndex / 20) * 0.5;
    const localDifficulty = cyclePosition * 0.2;
    const totalDifficulty = baseDifficulty + localDifficulty;

    // Color progression
    let colorCount = 4; // Levels 1-20
    if (levelIndex >= 100) {
        colorCount = 6; // Level 100+
    } else if (levelIndex >= 21) {
        colorCount = 5; // Level 21-99
    }

    // Target moves scales with difficulty
    const targetMoves = Math.max(10, Math.floor(15 + totalDifficulty * 2));

    return {
        totalDifficulty,
        baseDifficulty,
        localDifficulty,
        cyclePosition,
        colorCount,
        targetMoves,
    };
}

/**
 * Get the number of reverse-play injections based on difficulty
 */
export function getInjectionCount(difficulty: number): number {
    return Math.max(3, Math.floor(5 + difficulty * 1.5));
}
