/**
 * Modal Component - Win/Loss screens with confetti
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface ModalProps {
    isOpen: boolean;
    type: 'won' | 'lost';
    level: number;
    score: number;
    onNext?: () => void;
    onRetry?: () => void;
}

export function Modal({ isOpen, type, level, score, onNext, onRetry }: ModalProps) {
    // Trigger confetti on win
    useEffect(() => {
        if (isOpen && type === 'won') {
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#8b5cf6', '#3b82f6', '#fbbf24'],
                });
                confetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#8b5cf6', '#3b82f6', '#fbbf24'],
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };

            frame();
        }
    }, [isOpen, type]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

                    {/* Modal */}
                    <motion.div
                        className="glass-strong rounded-3xl p-8 max-w-md w-full relative z-10"
                        initial={{ scale: 0.8, y: 50 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.8, y: 50 }}
                        transition={{ type: 'spring', damping: 20 }}
                    >
                        {type === 'won' ? (
                            <>
                                <motion.div
                                    className="text-6xl font-bold text-center mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: 'spring' }}
                                >
                                    🎉 Victory!
                                </motion.div>
                                <p className="text-center text-gray-300 mb-6">
                                    Level {level} Complete!
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="text-6xl font-bold text-center mb-4 text-red-400">
                                    Game Over
                                </div>
                                <p className="text-center text-gray-300 mb-6">
                                    Out of moves on Level {level}
                                </p>
                            </>
                        )}

                        <div className="text-center mb-8">
                            <div className="text-sm text-gray-400">Final Score</div>
                            <div className="text-4xl font-bold text-white">{score.toLocaleString()}</div>
                        </div>

                        <div className="flex gap-4">
                            {type === 'won' && onNext && (
                                <button
                                    onClick={onNext}
                                    className="flex-1 px-6 py-4 bg-gradient-to-r from-vinu-purple-600 to-vinu-blue-600 hover:from-vinu-purple-500 hover:to-vinu-blue-500 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl"
                                >
                                    Next Level →
                                </button>
                            )}
                            {type === 'lost' && onRetry && (
                                <button
                                    onClick={onRetry}
                                    className="flex-1 px-6 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl"
                                >
                                    Try Again
                                </button>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
