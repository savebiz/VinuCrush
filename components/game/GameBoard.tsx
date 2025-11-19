/**
 * GameBoard Component - Main game logic (OLD VERSION - for backward compatibility)
 */

'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    Grid,
    getIndex,
    GRID_SIZE,
    checkMatches,
    applyGravity,
    STATUS_MATCH,
} from '@/lib/ecs/grid';
import { removeMatched, wouldCreateMatch } from '@/lib/ecs/match';
import { fillEmpty, clearFallingFlags, swapTiles } from '@/lib/ecs/gravity';

interface GameBoardProps {
    initialGrid: Grid;
    level: number;
    onMove?: (from: { x: number; y: number }, to: { x: number; y: number }) => void;
    onScore?: (points: number) => void;
}

const COLORS: Record<number, string> = {
    1: 'from-red-500 to-red-600',
    2: 'from-blue-500 to-blue-600',
    3: 'from-green-500 to-green-600',
    4: 'from-yellow-500 to-yellow-600',
    5: 'from-purple-500 to-purple-600',
    6: 'from-orange-500 to-orange-600',
    0: 'from-gray-800 to-gray-900',
    255: 'from-gray-800 to-gray-900',
};

export function GameBoard({ initialGrid, level, onMove, onScore }: GameBoardProps) {
    const [grid, setGrid] = useState<Grid>(initialGrid);
    const [selectedTile, setSelectedTile] = useState<{ x: number; y: number } | null>(null);
    const [score, setScore] = useState(0);
    const [moves, setMoves] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    // Process matches and cascades
    const processMatches = useCallback(async () => {
        setIsProcessing(true);
        let totalMatched = 0;
        let hasMatches = true;

        while (hasMatches) {
            const matchCount = checkMatches(grid);
            if (matchCount === 0) {
                hasMatches = false;
                break;
            }

            totalMatched += matchCount;
            await new Promise((resolve) => setTimeout(resolve, 300));

            removeMatched(grid);
            setGrid({ ...grid });
            await new Promise((resolve) => setTimeout(resolve, 200));

            applyGravity(grid);
            setGrid({ ...grid });
            await new Promise((resolve) => setTimeout(resolve, 400));

            fillEmpty(grid);
            clearFallingFlags(grid);
            setGrid({ ...grid });
            await new Promise((resolve) => setTimeout(resolve, 300));
        }

        if (totalMatched > 0) {
            const points = totalMatched * 10;
            setScore((prev) => prev + points);
            onScore?.(points);
        }

        setIsProcessing(false);
    }, [grid, onScore]);

    // Handle tile click
    const handleTileClick = useCallback(
        async (x: number, y: number) => {
            if (isProcessing) return;

            const color = grid.Types[getIndex(x, y)];
            if (color === 0 || color === 255) return;

            if (!selectedTile) {
                setSelectedTile({ x, y });
            } else {
                const dx = Math.abs(selectedTile.x - x);
                const dy = Math.abs(selectedTile.y - y);
                const isAdjacent = (dx === 1 && dy === 0) || (dx === 0 && dy === 1);

                if (isAdjacent) {
                    if (wouldCreateMatch(grid, selectedTile.x, selectedTile.y, x, y)) {
                        swapTiles(grid, selectedTile.x, selectedTile.y, x, y);
                        setGrid({ ...grid });
                        setMoves((prev) => prev + 1);
                        onMove?.(selectedTile, { x, y });
                        setTimeout(() => processMatches(), 300);
                    }
                }
                setSelectedTile(null);
            }
        },
        [grid, selectedTile, isProcessing, onMove, processMatches]
    );

    return (
        <div className="flex flex-col items-center gap-6">
            <div className="flex gap-8 text-white">
                <div className="text-center">
                    <div className="text-sm text-gray-400">Level</div>
                    <div className="text-2xl font-bold">{level}</div>
                </div>
                <div className="text-center">
                    <div className="text-sm text-gray-400">Score</div>
                    <div className="text-2xl font-bold">{score}</div>
                </div>
                <div className="text-center">
                    <div className="text-sm text-gray-400">Moves</div>
                    <div className="text-2xl font-bold">{moves}</div>
                </div>
            </div>

            <div
                className="grid gap-2 p-6 bg-gray-900/50 rounded-2xl backdrop-blur-sm"
                style={{
                    gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                    width: 'min(90vw, 600px)',
                    aspectRatio: '1',
                }}
            >
                {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
                    const x = index % GRID_SIZE;
                    const y = Math.floor(index / GRID_SIZE);
                    const idx = getIndex(x, y);
                    const color = grid.Types[idx];
                    const status = grid.Status[idx];
                    const isSelected = selectedTile?.x === x && selectedTile?.y === y;
                    const isMatched = (status & STATUS_MATCH) !== 0;
                    const colorClass = COLORS[color] || COLORS[0];

                    return (
                        <motion.button
                            key={`${x}-${y}`}
                            className={`relative w-full h-full rounded-lg bg-gradient-to-br ${colorClass} shadow-lg ${isSelected ? 'ring-4 ring-white' : ''
                                }`}
                            onClick={() => handleTileClick(x, y)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            animate={{ scale: isMatched ? 0.8 : 1, opacity: isMatched ? 0.3 : 1 }}
                        >
                            {color !== 0 && color !== 255 && (
                                <div className="absolute inset-2 rounded-md bg-white/20" />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
