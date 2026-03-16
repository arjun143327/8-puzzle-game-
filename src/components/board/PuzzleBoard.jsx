import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePuzzleStore } from '../../store/usePuzzleStore';
import Tile from './Tile';

const TILE_SIZE = 96;  // px — matches w-24 h-24
const GAP = 12;        // px — gap between tiles

const PuzzleBoard = () => {
  const { board, initializeBoard, isSolved } = usePuzzleStore();
  const boardSize = TILE_SIZE * 3 + GAP * 2;

  useEffect(() => {
    initializeBoard();
  }, [initializeBoard]);

  return (
    <div className="flex flex-col items-center gap-8">

      {/* Board container */}
      <div
        className="relative rounded-3xl p-4"
        style={{
          background: '#0A0F1E',
          border: '1.5px solid #1E2D4F',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        {/* Dot-grid background */}
        <div
          className="absolute inset-0 rounded-3xl opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, #4285F4 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Fixed-size canvas for absolute tiles */}
        <div
          className="relative"
          style={{ width: boardSize, height: boardSize }}
        >
          {board.map((value, index) => {
            const col = index % 3;
            const row = Math.floor(index / 3);
            const x = col * (TILE_SIZE + GAP);
            const y = row * (TILE_SIZE + GAP);

            return (
              <motion.div
                key={value === 0 ? 'blank' : value}
                className="absolute"
                animate={{ x, y }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 40,
                  mass: 0.8,
                }}
                style={{ width: TILE_SIZE, height: TILE_SIZE }}
              >
                <Tile value={value} index={index} />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Solved Banner */}
      <AnimatePresence>
        {isSolved && (
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-xl text-white"
            style={{
              background: 'linear-gradient(135deg, #34A853, #1B7B34)',
              boxShadow: '0 0 40px rgba(52, 168, 83, 0.5)',
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>🎉</span>
            Puzzle Solved!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PuzzleBoard;
