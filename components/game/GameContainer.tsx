/**
 * GameContainer - Glassmorphism layout for the game
 * Premium UI with VinuChain branding
 */

'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GameContainerProps {
    level: number;
    movesLeft: number;
    score: number;
    ingredientsCollected: number;
    targetIngredients: number;
    children: ReactNode;
    className?: string;
}

export function GameContainer({
    level,
    movesLeft,
    score,
    ingredientsCollected,
    targetIngredients,
    children,
    className,
}: GameContainerProps) {
    return (
        <div className={cn('flex flex-col items-center gap-6 p-4', className)}>
            {/* Header with glassmorphism */}
            <motion.div
                className="glass rounded-2xl p-6 w-full max-w-2xl"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex justify-between items-center gap-8">
                    {/* Level */}
                    <div className="text-center">
                        <div className="text-sm text-gray-300 font-medium mb-1">Level</div>
                        <div className="text-3xl font-bold bg-gradient-to-r from-vinu-purple-400 to-vinu-blue-400 bg-clip-text text-transparent">
                            {level}
                        </div>
                    </div>

                    {/* Moves Left */}
                    <div className="text-center">
                        <div className="text-sm text-gray-300 font-medium mb-1">Moves</div>
                        <div className={cn(
                            "text-3xl font-bold",
                            movesLeft <= 5 ? "text-red-400 animate-pulse" : "text-white"
                        )}>
                            {movesLeft}
                        </div>
                    </div>

                    {/* Ingredients */}
                    <div className="text-center">
                        <div className="text-sm text-gray-300 font-medium mb-1">Ingredients</div>
                        <div className="text-3xl font-bold text-yellow-400">
                            {ingredientsCollected}
                            <span className="text-xl text-gray-400">/{targetIngredients}</span>
                        </div>
                    </div>

                    {/* Score */}
                    <div className="text-center">
                        <div className="text-sm text-gray-300 font-medium mb-1">Score</div>
                        <div className="text-3xl font-bold text-white">
                            {score.toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Progress bar for ingredients */}
                <div className="mt-4 w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                        initial={{ width: 0 }}
                        animate={{
                            width: `${Math.min(100, (ingredientsCollected / targetIngredients) * 100)}%`
                        }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                </div>
            </motion.div>

            {/* Grid Area */}
            <motion.div
                className="glass-strong rounded-3xl p-8 w-full max-w-2xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                {children}
            </motion.div>
        </div>
    );
}
