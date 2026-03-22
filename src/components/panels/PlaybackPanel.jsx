import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { usePuzzleStore } from '../../store/usePuzzleStore';

const GOAL = [1, 2, 3, 4, 5, 6, 7, 8, 0];

// Describe which tile moved between two board states
function describeMove(prevBoard, currBoard) {
  if (!prevBoard) return null;
  const blankPrev = prevBoard.indexOf(0);
  const blankCurr = currBoard.indexOf(0);
  const movedTile = prevBoard[blankCurr]; // tile that moved into blank spot
  const dir = blankCurr - blankPrev;
  const label = dir === -1 ? '←' : dir === 1 ? '→' : dir === -3 ? '↑' : '↓';
  return { tile: movedTile, dir: label };
}

const NavBtn = ({ onClick, disabled, icon: Icon, title }) => (
  <motion.button
    onClick={onClick}
    disabled={disabled}
    whileHover={!disabled ? { scale: 1.08 } : {}}
    whileTap={!disabled ? { scale: 0.93 } : {}}
    title={title}
    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
    style={{
      background: disabled ? '#0A0F1E' : '#1E2D4F',
      border: `1.5px solid ${disabled ? '#1A2238' : '#2E4070'}`,
      opacity: disabled ? 0.35 : 1,
      cursor: disabled ? 'default' : 'pointer',
    }}
  >
    <Icon size={18} style={{ color: disabled ? '#3A4A6B' : '#E8EEFF' }} />
  </motion.button>
);

const PlaybackPanel = () => {
  const {
    isPlayback, mode, solutionPath, playbackStep,
    setPlaybackStep, playbackNext, playbackPrev,
  } = usePuzzleStore();

  const isAI = mode !== 'Human';
  const visible = isPlayback && isAI && solutionPath && solutionPath.length > 0;

  const total = solutionPath ? solutionPath.length - 1 : 0; // total moves
  const move = describeMove(
    solutionPath?.[playbackStep - 1],
    solutionPath?.[playbackStep]
  );

  const isFirst = playbackStep === 0;
  const isLast = playbackStep === total;

  // Keyboard arrow key support
  useEffect(() => {
    if (!visible) return;
    const handler = (e) => {
      if (e.key === 'ArrowRight') playbackNext();
      if (e.key === 'ArrowLeft') playbackPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [visible, playbackNext, playbackPrev]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          className="w-full max-w-md mx-auto rounded-3xl p-5"
          style={{
            background: '#0A0F1E',
            border: '1.5px solid #1E2D4F',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: '#34A853', boxShadow: '0 0 6px #34A853' }}
              />
              <span className="font-extrabold text-sm text-white tracking-tight">
                Solution Playback
              </span>
            </div>
            <div
              className="px-3 py-1 rounded-xl text-xs font-bold"
              style={{ background: '#34A85322', color: '#34A853', border: '1px solid #34A85344' }}
            >
              {total} move{total !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Current move description */}
          <div
            className="rounded-2xl px-4 py-3 mb-4 flex items-center justify-between"
            style={{ background: '#0F1629', border: '1px solid #1E2D4F' }}
          >
            <span className="text-sm font-semibold" style={{ color: '#6B7FAA' }}>
              {playbackStep === 0
                ? 'Initial State'
                : `Move ${playbackStep} — Slide tile `}
              {move && playbackStep > 0 && (
                <span
                  className="font-extrabold text-white ml-1"
                  style={{ fontSize: '1rem' }}
                >
                  {move.tile} {move.dir}
                </span>
              )}
            </span>
            {isLast && (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-lg"
                style={{ background: '#34A85320', color: '#34A853' }}
              >
                ✓ Solved
              </span>
            )}
          </div>

          {/* Scrubber */}
          <div className="mb-4">
            <input
              type="range"
              min={0}
              max={total}
              value={playbackStep}
              onChange={(e) => setPlaybackStep(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #4285F4 ${(playbackStep / total) * 100}%, #1E2D4F ${(playbackStep / total) * 100}%)`,
                outline: 'none',
              }}
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs" style={{ color: '#3A4A6B' }}>0</span>
              <span className="text-xs font-bold" style={{ color: '#4285F4' }}>
                {playbackStep} / {total}
              </span>
              <span className="text-xs" style={{ color: '#3A4A6B' }}>{total}</span>
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-center gap-3">
            <NavBtn
              icon={ChevronsLeft}
              onClick={() => setPlaybackStep(0)}
              disabled={isFirst}
              title="Go to start"
            />
            <NavBtn
              icon={ChevronLeft}
              onClick={playbackPrev}
              disabled={isFirst}
              title="Previous move (←)"
            />

            {/* Step counter pill */}
            <div
              className="flex-1 text-center py-2 rounded-2xl font-extrabold text-white text-sm"
              style={{ background: '#0F1629', border: '1px solid #1E2D4F' }}
            >
              Step {playbackStep} of {total}
            </div>

            <NavBtn
              icon={ChevronRight}
              onClick={playbackNext}
              disabled={isLast}
              title="Next move (→)"
            />
            <NavBtn
              icon={ChevronsRight}
              onClick={() => setPlaybackStep(total)}
              disabled={isLast}
              title="Go to end"
            />
          </div>

          <p className="text-center text-xs mt-3" style={{ color: '#3A4A6B' }}>
            Use ← → arrow keys to step through
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PlaybackPanel;
