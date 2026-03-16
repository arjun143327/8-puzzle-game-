import React from 'react';
import { motion } from 'framer-motion';
import { usePuzzleStore, SPEED_PRESETS } from '../../store/usePuzzleStore';

const SpeedControl = () => {
  const { speedIndex, setSpeedIndex } = usePuzzleStore();

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#6B7FAA' }}>
        Speed
      </p>
      <div className="flex flex-wrap gap-2">
        {SPEED_PRESETS.map((preset, i) => {
          const isActive = speedIndex === i;
          return (
            <motion.button
              key={preset.label}
              onClick={() => setSpeedIndex(i)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={
                isActive
                  ? { background: '#4285F4', color: '#fff', boxShadow: '0 0 10px rgba(66,133,244,0.4)' }
                  : { background: '#0F1629', color: '#6B7FAA', border: '1px solid #1E2D4F' }
              }
            >
              {preset.label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default SpeedControl;
