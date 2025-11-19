/**
 * Tile Component - Renders a single tile
 */

'use client';

import { motion } from 'framer-motion';

interface TileProps {
    color: number;
    x: number;
    y: number;
    isSelected: boolean;
    isMatched: boolean;
    onClick: () => void;
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

export function Tile({ color, x, y, isSelected, isMatched, onClick }: TileProps) {
    const colorClass = COLORS[color] || COLORS[0];

    return (
        <motion.button
            className={`
        relative w-full h-full rounded-lg bg-gradient-to-br ${colorClass}
        shadow-lg hover:shadow-xl transition-shadow
        ${isSelected ? 'ring-4 ring-white ring-opacity-80 scale-95' : ''}
        ${isMatched ? 'opacity-50' : 'opacity-100'}
      `}
            onClick={onClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
                scale: isMatched ? 0.8 : 1,
                opacity: isMatched ? 0.3 : 1,
            }}
            transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
            }}
            aria-label={`Tile at ${x}, ${y}`}
        >
            {color !== 0 && color !== 255 && (
                <div className="absolute inset-2 rounded-md bg-white/20" />
            )}
        </motion.button>
    );
}
