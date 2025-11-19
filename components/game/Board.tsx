/**
 * Board Component - Optimized with React refs
 * Uses ref for mutable grid state, useState only for render triggers
 */

'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Grid,
    getIndex,
    getXY,
    GRID_SIZE,
    GRID_TOTAL,
    checkMatches,
    applyGravity,
    STATUS_MATCH,
    STATUS_FALLING,
} from '@/lib/ecs/grid';
import { removeMatched, wouldCreateMatch } from '@/lib/ecs/match';
import { fillEmpty, clearFallingFlags, swapTiles } from '@/lib/ecs/gravity';

interface BoardProps {
    initialGrid: Grid;
    targetScore: number;
    onComplete?: (score: number, moves: number) => void;
}

// Candy colors mapping
const CANDY_COLORS: Record<number, { bg: string; shine: string }> = {
    1: { bg: 'bg-gradient-to-br from-red-400 to-red-600', shine: 'bg-red-300' },
    2: { bg: 'bg-gradient-to-br from-blue-400 to-blue-600', shine: 'bg-blue-300' },
    3: { bg: 'bg-gradient-to-br from-green-400 to-green-600', shine: 'bg-green-300' },
    4: { bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600', shine: 'bg-yellow-300' },
    5: { bg: 'bg-gradient-to-br from-purple-400 to-purple-600', shine: 'bg-purple-300' },
    6: { bg: 'bg-gradient-to-br from-orange-400 to-orange-600', shine: 'bg-orange-300' },
    0: { bg: 'bg-gray-800', shine: 'bg-gray-700' },
};

export function Board({ initialGrid, targetScore, onComplete }: BoardProps) {
    // Mutable grid ref for performance
    const gridRef = useRef<Grid>(initialGrid);

    // Render trigger - only update when animations start/stop
    const [renderKey, setRenderKey] = useState(0);
    const forceRender = useCallback(() => setRenderKey((k) => k + 1), []);

    // Game state
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [moves, setMoves] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    // Reset grid when initialGrid changes
    useEffect(() => {
        gridRef.current = initialGrid;
        setScore(0);
        setMoves(0);
        setIsComplete(false);
        setSelectedIndex(null);
        forceRender();
    }, [initialGrid, forceRender]);

    // Process matches and cascades
    const processMatches = useCallback(async () => {
        setIsProcessing(true);
        const grid = gridRef.current;
        let totalMatched = 0;

        // eslint-disable-next-line no-constant-condition
        while (true) {
            const matchCount = checkMatches(grid);
            if (matchCount === 0) break;

            totalMatched += matchCount;
            forceRender();
            await new Promise((r) => setTimeout(r, 300));

            removeMatched(grid);
            forceRender();
            await new Promise((r) => setTimeout(r, 200));

            applyGravity(grid);
            forceRender();
            await new Promise((r) => setTimeout(r, 400));

            fillEmpty(grid);
            clearFallingFlags(grid);
            forceRender();
            await new Promise((r) => setTimeout(r, 300));
        }

        if (totalMatched > 0) {
            const points = totalMatched * 10;
            setScore((prev) => {
                const newScore = prev + points;
                if (newScore >= targetScore && !isComplete) {
                    setIsComplete(true);
                    onComplete?.(newScore, moves);
                }
                return newScore;
            });
        }

        setIsProcessing(false);
    }, [forceRender, targetScore, isComplete, onComplete, moves]);

    // Attempt to swap two tiles
    const attemptSwap = useCallback(
        async (index1: number, index2: number) => {
            const grid = gridRef.current;
            const { x: x1, y: y1 } = getXY(index1);
            const { x: x2, y: y2 } = getXY(index2);

            // Check if swap would create a match
            if (wouldCreateMatch(grid, x1, y1, x2, y2)) {
                // Valid swap
                swapTiles(grid, x1, y1, x2, y2);
                setMoves((m) => m + 1);
                forceRender();

                await new Promise((r) => setTimeout(r, 300));
                await processMatches();
            } else {
                // Invalid swap - swap and swap back
                swapTiles(grid, x1, y1, x2, y2);
                forceRender();

                await new Promise((r) => setTimeout(r, 200));

                swapTiles(grid, x1, y1, x2, y2);
                forceRender();
            }
        },
        [forceRender, processMatches]
    );

    // Handle tile click
    const handleTileClick = useCallback(
        (index: number) => {
            if (isProcessing || isComplete) return;

            const grid = gridRef.current;
            const color = grid.Types[index];
            if (color === 0 || color === 255) return;

            if (selectedIndex === null) {
                setSelectedIndex(index);
            } else {
                // Check if adjacent
                const { x: x1, y: y1 } = getXY(selectedIndex);
                const { x: x2, y: y2 } = getXY(index);
                const dx = Math.abs(x1 - x2);
                const dy = Math.abs(y1 - y2);
                const isAdjacent = (dx === 1 && dy === 0) || (dx === 0 && dy === 1);

                if (isAdjacent) {
                    attemptSwap(selectedIndex, index);
                }

                setSelectedIndex(null);
            }
        },
        [selectedIndex, isProcessing, isComplete, attemptSwap]
    );

    const grid = gridRef.current;

    return (
        <div className="flex flex-col items-center gap-6">
            {/* Stats */}
            <div className="flex gap-8 text-white">
                <div className="text-center">
                    <div className="text-sm text-gray-400">Score</div>
                    <div className="text-2xl font-bold">{score}</div>
                </div>
                <div className="text-center">
                    <div className="text-sm text-gray-400">Target</div>
                    <div className="text-2xl font-bold">{targetScore}</div>
                </div>
                <div className="text-center">
                    <div className="text-sm text-gray-400">Moves</div>
                    <div className="text-2xl font-bold">{moves}</div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-md h-3 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (score / targetScore) * 100)}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>

            {/* Board Grid */}
            <div
                className="grid gap-2 p-6 bg-gray-900/50 rounded-2xl backdrop-blur-sm relative"
                style={{
                    gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                    width: 'min(90vw, 600px)',
                    aspectRatio: '1',
                }}
            >
                {Array.from({ length: GRID_TOTAL }).map((_, index) => {
                    const color = grid.Types[index];
                    const status = grid.Status[index];
                    const isSelected = selectedIndex === index;
                    const isMatched = (status & STATUS_MATCH) !== 0;
                    const isFalling = (status & STATUS_FALLING) !== 0;
                    const colors = CANDY_COLORS[color] || CANDY_COLORS[0];

                    return (
                        <motion.button
                            key={index}
                            className={`
                relative w-full h-full rounded-xl ${colors.bg}
                shadow-lg hover:shadow-xl transition-shadow
                ${isSelected ? 'ring-4 ring-white ring-opacity-80' : ''}
                ${isProcessing ? 'pointer-events-none' : ''}
              `}
                            onClick={() => handleTileClick(index)}
                            whileHover={!isProcessing ? { scale: 1.05 } : {}}
                            whileTap={!isProcessing ? { scale: 0.95 } : {}}
                            animate={{
                                scale: isMatched ? 0.7 : isSelected ? 0.95 : 1,
                                opacity: isMatched ? 0.3 : 1,
                                y: isFalling ? -10 : 0,
                            }}
                            transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 20,
                            }}
                        >
                            {/* Candy shine effect */}
                            {color !== 0 && color !== 255 && (
                                <div className={`absolute top-2 left-2 right-2 h-1/3 ${colors.shine} rounded-t-lg opacity-40`} />
                            )}
                        </motion.button>
                    );
                })}

                {/* Victory overlay */}
                <AnimatePresence>
                    {isComplete && (
                        <motion.div
                            className="absolute inset-0 bg-black/80 rounded-2xl flex items-center justify-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="text-center">
                                <motion.div
                                    className="text-6xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-4"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', delay: 0.2 }}
                                >
                                    Level Complete!
                                </motion.div>
                                <div className="text-white text-xl">
                                    Score: {score} | Moves: {moves}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
