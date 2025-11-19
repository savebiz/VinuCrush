/**
 * GameBoard Component - Main game logic
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
import { Tile } from './Tile';

interface GameBoardProps {
    initialGrid: Grid;
    level: number;
    onMove?: (from: { x: number; y: number }, to: { x: number; y: number }) => void;
    onScore?: (points: number) => void;
}

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
            // Check for matches
            const matchCount = checkMatches(grid);

            if (matchCount === 0) {
                hasMatches = false;
                break;
            }

            totalMatched += matchCount;

            // Wait for animation
            await new Promise((resolve) => setTimeout(resolve, 300));

            // Remove matched tiles
            removeMatched(grid);
            setGrid({ ...grid });

            // Wait for animation
            await new Promise((resolve) => setTimeout(resolve, 200));

            // Apply gravity
            applyGravity(grid);
            setGrid({ ...grid });

            // Wait for falling animation
            await new Promise((resolve) => setTimeout(resolve, 400));

            // Fill empty spaces
            fillEmpty(grid);
            clearFallingFlags(grid);
            setGrid({ ...grid });

            // Wait before checking for new matches
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
                // Select first tile
                setSelectedTile({ x, y });
            } else {
                // Check if tiles are adjacent
                const dx = Math.abs(selectedTile.x - x);
                const dy = Math.abs(selectedTile.y - y);
                const isAdjacent = (dx === 1 && dy === 0) || (dx === 0 && dy === 1);

                if (isAdjacent) {
                    // Check if swap would create a match
                    if (wouldCreateMatch(grid, selectedTile.x, selectedTile.y, x, y)) {
                        // Perform swap
                        swapTiles(grid, selectedTile.x, selectedTile.y, x, y);
                        setGrid({ ...grid });

                        setMoves((prev) => prev + 1);
                        onMove?.(selectedTile, { x, y });

                        // Process matches after a short delay
                        setTimeout(() => {
                            processMatches();
                        }, 300);
                    }
                }

                setSelectedTile(null);
            }
        },
        [grid, selectedTile, isProcessing, onMove, processMatches]
    );

    return (
        <div className="flex flex-col items-center gap-6">
            {/* Stats */}
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

            {/* Game Grid */}
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

                    return (
                        <Tile
                            key={`${x}-${y}`}
                            color={color}
                            x={x}
                            y={y}
                            isSelected={isSelected}
                            isMatched={isMatched}
                            onClick={() => handleTileClick(x, y)}
                        />
                    );
                })}
            </div>
        </div>
    );
}
