import React from 'react';
import { motion } from 'framer-motion';
import { usePuzzleStore } from '../store/usePuzzleStore';
import clsx from 'clsx';
import { Shuffle } from 'lucide-react';

const modes = ['BFS', 'DFS', 'GBFS', 'A*', 'ADFS', 'Human'];

const MODE_COLORS = {
  BFS:   { active: '#4285F4', glow: 'rgba(66,133,244,0.3)' },
  DFS:   { active: '#EA4335', glow: 'rgba(234,67,53,0.3)'  },
  GBFS:  { active: '#FBBC04', glow: 'rgba(251,188,4,0.3)'  },
  'A*':  { active: '#34A853', glow: 'rgba(52,168,83,0.3)'  },
  ADFS:  { active: '#8B5CF6', glow: 'rgba(139,92,246,0.3)' },
  Human: { active: '#06B6D4', glow: 'rgba(6,182,212,0.3)'  },
};

const Header = () => {
  const { mode, setMode, initializeBoard } = usePuzzleStore();
  const currentColor = MODE_COLORS[mode];

  return (
    <header
      className="sticky top-0 z-50 px-6 py-4"
      style={{
        background: 'rgba(7, 11, 24, 0.92)',
        borderBottom: '1px solid #1E2D4F',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap gap-4 items-center justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-lg"
            style={{
              background: 'linear-gradient(135deg, #4285F4, #8B5CF6)',
              boxShadow: '0 0 20px rgba(66,133,244,0.4)',
              color: 'white',
            }}
          >
            8
          </div>
          <div>
            <h1 className="font-extrabold text-lg leading-none text-white tracking-tight">
              8-Puzzle
            </h1>
            <p className="text-xs font-medium" style={{ color: '#6B7FAA' }}>
              AI Explorer
            </p>
          </div>
        </div>

        {/* Mode Tabs */}
        <div
          className="flex rounded-2xl p-1 gap-1"
          style={{ background: '#0F1629', border: '1px solid #1E2D4F' }}
        >
          {modes.map((m) => {
            const isActive = mode === m;
            const color = MODE_COLORS[m];
            return (
              <motion.button
                key={m}
                onClick={() => setMode(m)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-4 py-1.5 rounded-xl text-sm font-bold transition-all duration-200"
                style={
                  isActive
                    ? {
                        background: color.active,
                        color: '#fff',
                        boxShadow: `0 0 14px ${color.glow}`,
                      }
                    : { color: '#6B7FAA' }
                }
              >
                {m}
              </motion.button>
            );
          })}
        </div>

        {/* Shuffle Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={initializeBoard}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white"
          style={{
            background: 'linear-gradient(135deg, #4285F4, #8B5CF6)',
            boxShadow: '0 4px 20px rgba(66,133,244,0.35)',
          }}
        >
          <Shuffle size={16} />
          Shuffle
        </motion.button>
      </div>
    </header>
  );
};

export default Header;
