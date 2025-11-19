/**
 * Tile Component - Premium drag-to-swap physics
 * Uses Framer Motion layout animations for automatic gravity
 */

'use client';

import { motion, PanInfo } from 'framer-motion';
import { TileType, TILE_ASSETS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface TileComponentProps {
    tile: {
        id: string;
        type: TileType;
        x: number;
        y: number;
    };
    isMatched: boolean;
    onDragEnd: (tileId: string, info: PanInfo) => void;
    gridSize: number;
}

export function TileComponent({ tile, isMatched, onDragEnd, gridSize }: TileComponentProps) {
    const isIngredient = tile.type === TileType.INGREDIENT;

    return (
        <motion.div
            key={tile.id}
            layout // CRITICAL: Automatic gravity animation
            drag
            dragSnapToOrigin={true} // Snap back if invalid
            dragElastic={0.1} // Tight, premium feel
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            onDragEnd={(_, info) => onDragEnd(tile.id, info)}
            className={cn(
                'relative w-full h-full cursor-grab active:cursor-grabbing',
                'rounded-xl overflow-hidden',
                isIngredient && 'ring-2 ring-yellow-400 animate-glow'
            )}
            initial={{ scale: 0, opacity: 0, y: -50 }}
            animate={{
                scale: isMatched ? 0 : 1,
                opacity: isMatched ? 0 : 1,
                y: 0,
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
                layout: {
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                },
                scale: {
                    type: 'spring',
                    stiffness: 500,
                    damping: 25,
                },
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            {/* Tile image */}
            <div className="absolute inset-0 p-1">
                <img
                    src={TILE_ASSETS[tile.type]}
                    alt={tile.type}
                    className="w-full h-full object-contain pointer-events-none select-none"
                    draggable={false}
                />
            </div>

            {/* Golden glow for ingredients */}
            {isIngredient && (
                <>
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 pointer-events-none" />
                    <div className="absolute inset-0 border-2 border-yellow-400/50 rounded-xl pointer-events-none animate-pulse" />
                </>
            )}

            {/* Shimmer effect */}
            <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
                style={{
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 3s linear infinite',
                }}
            />
        </motion.div>
    );
}
