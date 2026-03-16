import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePuzzleStore } from '../../store/usePuzzleStore';
import { Timer, MousePointer, Trophy, Activity, Layers, Hash, GitBranch } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center gap-3 rounded-2xl px-4 py-3"
    style={{ background: '#0F1629', border: '1px solid #1E2D4F' }}
  >
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: `${color}20`, border: `1.5px solid ${color}44` }}
    >
      <Icon size={16} style={{ color }} />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-widest truncate" style={{ color: '#6B7FAA' }}>
        {label}
      </p>
      <p className="text-xl font-extrabold text-white leading-tight">{value ?? '—'}</p>
      {sub && <p className="text-xs" style={{ color: '#6B7FAA' }}>{sub}</p>}
    </div>
  </motion.div>
);

const StatsPanel = () => {
  const { moves, timer, mode, personalBest, aiStats, moveLog } = usePuzzleStore();

  const fmt = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    return `${m}:${(s % 60).toString().padStart(2, '0')}`;
  };

  const fmtMs = (ms) => ms < 1000 ? `${ms.toFixed(0)}ms` : `${(ms / 1000).toFixed(2)}s`;

  return (
    <div
      className="rounded-3xl p-5 flex flex-col gap-4 h-full"
      style={{
        background: '#0A0F1E',
        border: '1.5px solid #1E2D4F',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
      }}
    >
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#34A853', boxShadow: '0 0 8px #34A853' }} />
        <h2 className="font-extrabold text-sm text-white tracking-tight">Stats & Live Log</h2>
      </div>

      {/* Human mode */}
      {mode === 'Human' && (
        <div className="flex flex-col gap-2">
          <StatCard icon={MousePointer} label="Moves" value={moves} color="#4285F4" />
          <StatCard icon={Timer} label="Time" value={fmt(timer)} color="#FBBC04" />
          {personalBest && (
            <div
              className="rounded-2xl p-3 text-center"
              style={{ background: 'rgba(52,168,83,0.12)', border: '1.5px solid rgba(52,168,83,0.35)' }}
            >
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <Trophy size={12} style={{ color: '#34A853' }} />
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#34A853' }}>Personal Best</p>
              </div>
              <p className="text-base font-extrabold text-white">{personalBest.moves} moves · {fmt(personalBest.timer)}</p>
            </div>
          )}
        </div>
      )}

      {/* AI mode */}
      {mode !== 'Human' && (
        <>
          <div className="flex flex-col gap-2">
            <StatCard icon={Activity} label="Nodes Explored" value={aiStats.nodesExplored.toLocaleString()} color="#4285F4" />
            <StatCard icon={Layers} label="Frontier Size" value={aiStats.frontierSize.toLocaleString()} color="#8B5CF6" />
            <StatCard
              icon={Hash}
              label="Path Length"
              value={aiStats.pathLength !== null ? `${aiStats.pathLength} moves` : '—'}
              color="#34A853"
            />
            <StatCard icon={Timer} label="Time" value={fmtMs(aiStats.timeMs)} color="#FBBC04" />

            {/* f/g/h only for A* / GBFS / ADFS */}
            {['A*', 'GBFS', 'ADFS'].includes(mode) && (
              <div
                className="grid grid-cols-3 gap-2 rounded-2xl p-3"
                style={{ background: '#0F1629', border: '1px solid #1E2D4F' }}
              >
                {[['f(n)', aiStats.f, '#EC4899'], ['g(n)', aiStats.g, '#4285F4'], ['h(n)', aiStats.h, '#FBBC04']].map(([k, v, c]) => (
                  <div key={k} className="text-center">
                    <p className="text-xs font-bold font-mono" style={{ color: c }}>{k}</p>
                    <p className="text-lg font-extrabold text-white">{v ?? '—'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Move Log */}
          {moveLog.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#6B7FAA' }}>Move Log</p>
              <div
                className="rounded-2xl overflow-y-auto flex flex-col gap-1 p-2"
                style={{ background: '#0F1629', border: '1px solid #1E2D4F', maxHeight: '140px' }}
              >
                {moveLog.slice(-30).map((entry, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs px-2 py-1 rounded-lg" style={{ background: '#070B18' }}>
                    <span className="font-mono font-bold" style={{ color: '#4285F4' }}>#{entry.step}</span>
                    <span className="font-mono text-white truncate">{entry.board?.join(' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StatsPanel;
