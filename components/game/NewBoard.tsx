/**
 * NewBoard Component - 8x8 grid with drag-to-swap
 * Uses AnimatePresence for smooth tile transitions
 */

'use client';

import { useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { TileComponent } from './Tile';
import { Tile } from '@/hooks/useGameLogic';
import { GAME_CONFIG } from '@/lib/constants';

interface NewBoardProps {
    grid: Tile[];
    matchedIds: Set<string>;
    onSwap: (sourceIndex: number, targetIndex: number) => void;
    isProcessing: boolean;
}

export function NewBoard({ grid, matchedIds, onSwap, isProcessing }: NewBoardProps) {
    /**
     * Handle drag end - calculate which tile was dropped on
     */
    const handleDragEnd = useCallback(
        (tileId: string, info: PanInfo) => {
            if (isProcessing) return;

            const tile = grid.find((t) => t.id === tileId);
            if (!tile) return;

            const { offset } = info;
            const threshold = 40; // Minimum drag distance

            // Determine direction
            let targetX = tile.x;
            let targetY = tile.y;

            if (Math.abs(offset.x) > Math.abs(offset.y)) {
                // Horizontal drag
                if (offset.x > threshold && tile.x < GAME_CONFIG.GRID_SIZE - 1) {
                    targetX = tile.x + 1;
                } else if (offset.x < -threshold && tile.x > 0) {
                    targetX = tile.x - 1;
                }
            } else {
                // Vertical drag
                if (offset.y > threshold && tile.y < GAME_CONFIG.GRID_SIZE - 1) {
                    targetY = tile.y + 1;
                } else if (offset.y < -threshold && tile.y > 0) {
                    targetY = tile.y - 1;
                }
            }

            // If no valid target, return
            if (targetX === tile.x && targetY === tile.y) return;

            // Find source and target indices
            const sourceIndex = grid.findIndex((t) => t.id === tileId);
            const targetIndex = grid.findIndex((t) => t.x === targetX && t.y === targetY);

            if (sourceIndex !== -1 && targetIndex !== -1) {
                onSwap(sourceIndex, targetIndex);
            }
        },
        [grid, onSwap, isProcessing]
    );

    return (
        <div
            className="grid gap-2 w-full aspect-square max-w-2xl mx-auto"
            style={{
                gridTemplateColumns: `repeat(${GAME_CONFIG.GRID_SIZE}, minmax(0, 1fr))`,
            }}
        >
            <AnimatePresence mode="popLayout">
                {grid.map((tile) => (
                    <TileComponent
                        key={tile.id}
                        tile={tile}
                        isMatched={matchedIds.has(tile.id)}
                        onDragEnd={handleDragEnd}
                        gridSize={GAME_CONFIG.GRID_SIZE}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}
