'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GameContainer } from '@/components/game/GameContainer';
import { NewBoard } from '@/components/game/NewBoard';
import { Modal } from '@/components/game/Modal';
import { useGameLogic } from '@/hooks/useGameLogic';
import { getLevelConfig } from '@/lib/constants';

export default function Home() {
  const { state, attemptSwap, nextLevel, retryLevel } = useGameLogic(1);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());

  const levelConfig = getLevelConfig(state.level);

  // Update matched IDs when processing
  useEffect(() => {
    if (state.isProcessing) {
      setMatchedIds(new Set());
    }
  }, [state.isProcessing]);

  const handleSwap = async (sourceIndex: number, targetIndex: number) => {
    const success = await attemptSwap(sourceIndex, targetIndex);
    if (!success) {
      // Invalid move - tiles will snap back automatically
      console.log('Invalid move');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Title */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-6xl font-bold bg-gradient-to-r from-vinu-purple-400 via-vinu-blue-400 to-vinu-neon-blue bg-clip-text text-transparent mb-2">
          VinuCrush
        </h1>
        <p className="text-gray-400 text-lg">
          {levelConfig.name} • Collect {levelConfig.targetIngredients} Ingredients
        </p>
      </motion.div>

      {/* Game Container */}
      <GameContainer
        level={state.level}
        movesLeft={state.movesLeft}
        score={state.score}
        ingredientsCollected={state.ingredientsCollected}
        targetIngredients={state.targetIngredients}
      >
        <NewBoard
          grid={state.grid}
          matchedIds={matchedIds}
          onSwap={handleSwap}
          isProcessing={state.isProcessing}
        />
      </GameContainer>

      {/* Win/Loss Modals */}
      <Modal
        isOpen={state.gameStatus === 'won'}
        type="won"
        level={state.level}
        score={state.score}
        onNext={nextLevel}
      />

      <Modal
        isOpen={state.gameStatus === 'lost'}
        type="lost"
        level={state.level}
        score={state.score}
        onRetry={retryLevel}
      />

      {/* Footer */}
      <motion.div
        className="mt-12 text-center text-gray-500 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <p>Powered by VinuChain • Drag to Match</p>
        <p className="mt-1">Level {state.level} • {state.movesLeft} moves left</p>
      </motion.div>
    </div>
  );
}
