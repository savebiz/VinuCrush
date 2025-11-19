'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Board } from '@/components/game/Board';
import { generateLevel, getDifficultyParams } from '@/lib/pcg';
import { submitProgress, shouldSubmitProgress, getUserAddress } from '@/lib/web3/vinu';

export default function Home() {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [levelData, setLevelData] = useState<ReturnType<typeof generateLevel> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<{
    level: number;
    txHash?: string;
  } | null>(null);

  useEffect(() => {
    const data = generateLevel(currentLevel);
    setLevelData(data);
  }, [currentLevel]);

  const handleLevelComplete = async (score: number, moves: number) => {
    console.log(`Level ${currentLevel} complete! Score: ${score}, Moves: ${moves}`);

    // Check if we should submit to VinuChain (every 5 levels)
    if (shouldSubmitProgress(currentLevel)) {
      setIsSubmitting(true);

      try {
        const userAddress = getUserAddress();
        const result = await submitProgress(userAddress, currentLevel, score);

        if (result.success) {
          console.log('Progress submitted to VinuChain!', result.txHash);
          setLastSubmission({
            level: currentLevel,
            txHash: result.txHash,
          });
        } else {
          console.error('Failed to submit progress:', result.error);
        }
      } catch (error) {
        console.error('Error submitting progress:', error);
      } finally {
        setIsSubmitting(false);
      }
    }

    // Auto-advance after a delay
    setTimeout(() => {
      setCurrentLevel((prev) => prev + 1);
    }, 2000);
  };

  const handleNextLevel = () => {
    setCurrentLevel((prev) => prev + 1);
  };

  const handlePrevLevel = () => {
    setCurrentLevel((prev) => Math.max(1, prev - 1));
  };

  const handleRestart = () => {
    const data = generateLevel(currentLevel);
    setLevelData(data);
  };

  if (!levelData) return null;

  const params = levelData.params;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent mb-2">
          VinuCrush
        </h1>
        <p className="text-gray-400 text-lg">
          Infinite Match-3 Powered by VinuChain
        </p>
      </motion.div>

      {/* Level Info */}
      <motion.div
        className="mb-6 p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="flex gap-6 text-sm text-gray-300">
          <div>
            <span className="text-gray-500">Level:</span>{' '}
            <span className="font-semibold text-white">{currentLevel}</span>
          </div>
          <div>
            <span className="text-gray-500">Difficulty:</span>{' '}
            <span className="font-semibold text-white">{params.totalDifficulty.toFixed(1)}</span>
          </div>
          <div>
            <span className="text-gray-500">Colors:</span>{' '}
            <span className="font-semibold text-white">{params.colorCount}</span>
          </div>
          <div>
            <span className="text-gray-500">Cycle:</span>{' '}
            <span className="font-semibold text-white">{params.cyclePosition}/20</span>
          </div>
          {shouldSubmitProgress(currentLevel) && (
            <div>
              <span className="text-yellow-400">⚡ Milestone Level!</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* VinuChain Status */}
      {(isSubmitting || lastSubmission) && (
        <motion.div
          className="mb-4 p-3 bg-purple-900/30 border border-purple-500/50 rounded-lg"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2 text-purple-300">
              <div className="animate-spin h-4 w-4 border-2 border-purple-400 border-t-transparent rounded-full" />
              <span>Submitting to VinuChain...</span>
            </div>
          ) : lastSubmission && (
            <div className="text-green-300 text-sm">
              ✓ Level {lastSubmission.level} saved to VinuChain
              {lastSubmission.txHash && (
                <span className="ml-2 text-gray-400 font-mono text-xs">
                  {lastSubmission.txHash.slice(0, 10)}...
                </span>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Game Board */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Board
          key={`${currentLevel}-${levelData.targetScore}`}
          initialGrid={levelData.grid}
          targetScore={levelData.targetScore}
          onComplete={handleLevelComplete}
        />
      </motion.div>

      {/* Level Controls */}
      <motion.div
        className="mt-8 flex gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <button
          onClick={handlePrevLevel}
          disabled={currentLevel === 1}
          className="px-6 py-3 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
        >
          Previous
        </button>
        <button
          onClick={handleRestart}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
        >
          Restart
        </button>
        <button
          onClick={handleNextLevel}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
        >
          Next Level
        </button>
      </motion.div>

      {/* Footer */}
      <motion.div
        className="mt-12 text-center text-gray-500 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <p>Powered by VinuChain • Reverse-Play PCG Algorithm</p>
        <p className="mt-1">
          Level {currentLevel} • Difficulty {params.totalDifficulty.toFixed(1)} • {params.colorCount} Colors
        </p>
        {shouldSubmitProgress(currentLevel) && (
          <p className="mt-1 text-yellow-400">
            ⚡ Progress will be saved to blockchain on completion
          </p>
        )}
      </motion.div>
    </div>
  );
}
