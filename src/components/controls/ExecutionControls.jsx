import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react';
import { usePuzzleStore } from '../../store/usePuzzleStore';

const Btn = ({ onClick, icon: Icon, label, color = '#4285F4', disabled = false, glow = false }) => (
  <motion.button
    onClick={onClick}
    disabled={disabled}
    whileHover={!disabled ? { scale: 1.05 } : {}}
    whileTap={!disabled ? { scale: 0.95 } : {}}
    className="flex flex-col items-center gap-1.5 flex-1"
    title={label}
  >
    <div
      className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all"
      style={{
        background: disabled ? '#0F1629' : `${color}22`,
        border: `1.5px solid ${disabled ? '#1E2D4F' : color + '55'}`,
        boxShadow: glow && !disabled ? `0 0 14px ${color}55` : 'none',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Icon size={20} style={{ color: disabled ? '#6B7FAA' : color }} />
    </div>
    <span className="text-xs font-semibold" style={{ color: disabled ? '#3A4A6B' : '#6B7FAA' }}>
      {label}
    </span>
  </motion.button>
);

const ExecutionControls = () => {
  const { mode, isRunning, isPaused, runAI, pauseAI, resumeAI, stepAI, resetAI } = usePuzzleStore();
  const isAI = mode !== 'Human';

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#6B7FAA' }}>
        Controls
      </p>
      <div className="flex gap-2">
        {!isRunning && !isPaused && (
          <Btn
            icon={Play}
            label="Run"
            color="#34A853"
            onClick={runAI}
            disabled={!isAI}
            glow
          />
        )}
        {isRunning && !isPaused && (
          <Btn icon={Pause} label="Pause" color="#FBBC04" onClick={pauseAI} glow />
        )}
        {isPaused && (
          <Btn icon={Play} label="Resume" color="#34A853" onClick={resumeAI} glow />
        )}
        <Btn
          icon={SkipForward}
          label="Step"
          color="#4285F4"
          onClick={stepAI}
          disabled={!isAI || (isRunning && !isPaused)}
        />
        <Btn
          icon={RotateCcw}
          label="Reset"
          color="#EA4335"
          onClick={resetAI}
          disabled={!isAI}
        />
      </div>
    </div>
  );
};

export default ExecutionControls;
