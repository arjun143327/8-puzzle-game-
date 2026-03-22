import React from 'react';
import Header from './components/Header';
import PuzzleBoard from './components/board/PuzzleBoard';
import StatsPanel from './components/panels/StatsPanel';
import PlaybackPanel from './components/panels/PlaybackPanel';
import SpeedControl from './components/controls/SpeedControl';
import ExecutionControls from './components/controls/ExecutionControls';
import { usePuzzleStore } from './store/usePuzzleStore';
import { Cpu } from 'lucide-react';

const ALGO_INFO = {
  BFS:   { color: '#4285F4', desc: 'Level-by-level. Guaranteed shortest path.', tag: 'Uninformed' },
  DFS:   { color: '#EA4335', desc: 'Deep first, then backtracks. Not optimal.', tag: 'Uninformed' },
  GBFS:  { color: '#FBBC04', desc: 'Closest-looking node first. Fast but not optimal.', tag: 'Informed' },
  'A*':  { color: '#34A853', desc: 'f(n) = g(n) + h(n). Optimal and efficient.', tag: 'Informed' },
  ADFS:  { color: '#8B5CF6', desc: 'A* selects, DFS bursts. Fewest nodes expanded.', tag: 'Novel Hybrid' },
  Human: { color: '#06B6D4', desc: 'Click tiles to slide. Race the clock!', tag: 'Play Mode' },
};

function App() {
  const { mode, dfsDepthLimit, setDfsDepthLimit } = usePuzzleStore();
  const info = ALGO_INFO[mode];
  const isAI = mode !== 'Human';
  const showFGH = ['A*', 'GBFS', 'ADFS'].includes(mode);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#070B18' }}>
      <Header />

      {/* Mode info strip */}
      <div
        className="px-6 py-2.5 flex items-center gap-3"
        style={{
          background: `linear-gradient(90deg, ${info.color}18, transparent)`,
          borderBottom: `1px solid ${info.color}30`,
        }}
      >
        <span
          className="px-2.5 py-0.5 rounded-lg text-xs font-bold"
          style={{ background: `${info.color}25`, color: info.color }}
        >
          {info.tag}
        </span>
        <span className="text-sm" style={{ color: '#6B7FAA' }}>{info.desc}</span>
      </div>

      <main className="flex-grow max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* LEFT — Controls */}
        <div className="lg:col-span-3 lg:order-1 order-2">
          <div
            className="rounded-3xl p-5 flex flex-col gap-5"
            style={{
              background: '#0A0F1E',
              border: '1.5px solid #1E2D4F',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
            }}
          >
            <div className="flex items-center gap-2">
              <Cpu size={15} style={{ color: '#4285F4' }} />
              <h2 className="font-extrabold text-sm text-white tracking-tight">Controls</h2>
            </div>

            <ExecutionControls />

            <div style={{ borderTop: '1px solid #1E2D4F' }} />

            <SpeedControl />

            {/* DFS depth limit input */}
            {mode === 'DFS' && (
              <>
                <div style={{ borderTop: '1px solid #1E2D4F' }} />
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#6B7FAA' }}>
                    DFS Depth Limit
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={5}
                      max={200}
                      value={dfsDepthLimit}
                      onChange={(e) => setDfsDepthLimit(Number(e.target.value))}
                      className="w-full rounded-xl px-3 py-2 font-bold text-white text-sm"
                      style={{
                        background: '#0F1629',
                        border: '1.5px solid #EA433588',
                        outline: 'none',
                        color: '#EA4335',
                      }}
                    />
                  </div>
                  <p className="text-xs" style={{ color: '#6B7FAA' }}>
                    Prevents infinite loops. Default: 50
                  </p>
                </div>
              </>
            )}

            {/* Algorithm info card */}
            {isAI && (
              <>
                <div style={{ borderTop: '1px solid #1E2D4F' }} />
                <div
                  className="rounded-2xl p-3 flex flex-col gap-1"
                  style={{ background: `${info.color}12`, border: `1.5px solid ${info.color}30` }}
                >
                  <p className="text-xs font-bold" style={{ color: info.color }}>{mode}</p>
                  <p className="text-xs" style={{ color: '#8899BB' }}>{info.desc}</p>
                  {showFGH && (
                    <p className="text-xs font-mono mt-1" style={{ color: '#6B7FAA' }}>
                      f(n) = g(n) + h(n) · Manhattan Distance
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* CENTER — Board + Playback */}
        <div className="lg:col-span-6 lg:order-2 order-1 flex flex-col items-center gap-5 py-4">
          <PuzzleBoard />
          <PlaybackPanel />
        </div>

        {/* RIGHT — Stats */}
        <div className="lg:col-span-3 lg:order-3 order-3">
          <StatsPanel />
        </div>
      </main>
    </div>
  );
}

export default App;
