import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { usePuzzleStore } from '../../store/usePuzzleStore';
import { getValidMoves } from '../../utils/puzzle';

const TILE_STYLES = {
  1: { bg: '#4285F4', shadow: '#1557CC' },
  2: { bg: '#EA4335', shadow: '#B31412' },
  3: { bg: '#FBBC04', shadow: '#C98D00' },
  4: { bg: '#34A853', shadow: '#1B7B34' },
  5: { bg: '#8B5CF6', shadow: '#5B21B6' },
  6: { bg: '#06B6D4', shadow: '#047A92' },
  7: { bg: '#F97316', shadow: '#C45106' },
  8: { bg: '#EC4899', shadow: '#9D1C5C' },
};

const Tile = ({ value, index }) => {
  const { mode, board, handleTileClick, isSolved } = usePuzzleStore();
  const isBlank = value === 0;
  const validMoves = getValidMoves(board);
  const isValidMove = mode === 'Human' && !isSolved && validMoves.includes(index);
  const style = TILE_STYLES[value];

  if (isBlank) {
    return (
      <div
        className="w-full h-full rounded-2xl"
        style={{ background: '#0A0F1E', border: '2px dashed #1E2D4F' }}
      />
    );
  }

  return (
    <motion.button
      onClick={() => handleTileClick(index)}
      whileHover={isValidMove ? { scale: 1.07, y: -3 } : {}}
      whileTap={isValidMove ? { scale: 0.95, y: 3 } : {}}
      className={clsx(
        "w-full h-full rounded-2xl font-extrabold text-white select-none",
        "flex items-center justify-center transition-shadow duration-100",
        isValidMove ? "cursor-pointer" : "cursor-default",
      )}
      style={{
        fontSize: '2.2rem',
        letterSpacing: '-0.04em',
        background: isSolved ? '#34A853' : style?.bg,
        boxShadow: isSolved
          ? `0 4px 0 #1B7B34`
          : `0 4px 0 ${style?.shadow}`,
        outline: isValidMove ? `3px solid rgba(255,255,255,0.3)` : 'none',
        outlineOffset: '2px',
      }}
      aria-label={`Tile ${value}`}
    >
      {value}
    </motion.button>
  );
};

export default Tile;
