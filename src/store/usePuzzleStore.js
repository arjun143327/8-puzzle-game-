import { create } from 'zustand';
import { generatePuzzle, getValidMoves, applyMove, isGoal, isSolvable } from '../utils/puzzle';
import { BFS } from '../algorithms/BFS';
import { DFS } from '../algorithms/DFS';
import { AStar } from '../algorithms/AStar';

// Speed presets: label → ms delay between steps
export const SPEED_PRESETS = [
  { label: 'Slow',    ms: 1000 },
  { label: 'Normal',  ms: 200  },
  { label: 'Fast',    ms: 50   },
  { label: 'Turbo',   ms: 10   },
  { label: 'Instant', ms: 0    },
];

const algorithmFactories = {
  BFS:   () => new BFS(),
  DFS:   () => new DFS(50),
  'A*':  () => new AStar(),
  GBFS:  null,   // Phase 3
  ADFS:  null,   // Phase 3
  Human: null,
};

let intervalId = null;
let timerIntervalId = null;
let algorithmInstance = null;

export const usePuzzleStore = create((set, get) => ({
  // —— Board state ——
  board: [],
  initialBoard: [],         // board state when algorithm started (for Reset)
  mode: 'Human',
  isSolved: false,

  // —— Human mode ——
  moves: 0,
  timer: 0,
  personalBest: JSON.parse(localStorage.getItem('eightPuzzleBest')) || null,

  // —— AI execution state ——
  isRunning: false,
  isPaused: false,
  speedIndex: 1,            // index into SPEED_PRESETS (default: Normal)
  dfsDepthLimit: 50,

  // —— AI stats ——
  aiStats: {
    nodesExplored: 0,
    frontierSize: 0,
    pathLength: null,
    timeMs: 0,
    f: null, g: null, h: null,
  },
  moveLog: [],

  // —— Init ——
  initializeBoard: () => {
    get()._stopAll();
    const newBoard = generatePuzzle();
    set({
      board: newBoard,
      initialBoard: newBoard,
      isSolved: false,
      moves: 0,
      timer: 0,
      isRunning: false,
      isPaused: false,
      aiStats: { nodesExplored: 0, frontierSize: 0, pathLength: null, timeMs: 0, f: null, g: null, h: null },
      moveLog: [],
    });
    algorithmInstance = null;
  },

  setMode: (mode) => {
    get()._stopAll();
    set({
      mode,
      isRunning: false,
      isPaused: false,
      aiStats: { nodesExplored: 0, frontierSize: 0, pathLength: null, timeMs: 0, f: null, g: null, h: null },
      moveLog: [],
    });
    algorithmInstance = null;
  },

  setSpeedIndex: (index) => {
    set({ speedIndex: index });
    // If running, restart interval with new speed
    const { isRunning, isPaused } = get();
    if (isRunning && !isPaused) {
      get()._restartInterval();
    }
  },

  setDfsDepthLimit: (limit) => {
    set({ dfsDepthLimit: limit });
    if (algorithmInstance?.setDepthLimit) {
      algorithmInstance.setDepthLimit(limit);
    }
  },

  // —— AI Run ——
  runAI: () => {
    const { board, mode, speedIndex, dfsDepthLimit } = get();
    const factory = algorithmFactories[mode];
    if (!factory) return;

    get()._stopAll();
    algorithmInstance = factory();
    if (mode === 'DFS') algorithmInstance.setDepthLimit(dfsDepthLimit);

    const preset = SPEED_PRESETS[speedIndex];

    // Instant mode: run synchronously
    if (preset.ms === 0) {
      const result = algorithmInstance.solve(board);
      const path = result.path || [];
      set({
        board: path.length > 0 ? path[path.length - 1] : board,
        isSolved: result.done && path.length > 0,
        isRunning: false,
        moveLog: path.map((b, i) => ({ step: i, board: b })),
        aiStats: {
          nodesExplored: result.nodesExplored,
          frontierSize: result.frontierSize,
          pathLength: path.length - 1,
          timeMs: result.timeMs,
          f: result.f, g: result.g, h: result.h,
        },
      });
      return;
    }

    algorithmInstance.init(board);
    set({ isRunning: true, isPaused: false, initialBoard: board, moveLog: [] });
    get()._startInterval();
  },

  pauseAI: () => {
    clearInterval(intervalId);
    intervalId = null;
    set({ isPaused: true, isRunning: true });
  },

  resumeAI: () => {
    set({ isPaused: false });
    get()._startInterval();
  },

  stepAI: () => {
    const { board, mode, dfsDepthLimit } = get();
    const factory = algorithmFactories[mode];
    if (!factory) return;
    // Auto-init if user clicks Step before Run
    if (!algorithmInstance) {
      algorithmInstance = factory();
      if (mode === 'DFS') algorithmInstance.setDepthLimit(dfsDepthLimit);
      algorithmInstance.init(board);
      set({ initialBoard: board, isPaused: true });
    }
    get()._executeStep();
  },

  resetAI: () => {
    get()._stopAll();
    const { initialBoard } = get();
    set({
      board: initialBoard,
      isSolved: false,
      isRunning: false,
      isPaused: false,
      aiStats: { nodesExplored: 0, frontierSize: 0, pathLength: null, timeMs: 0, f: null, g: null, h: null },
      moveLog: [],
    });
    algorithmInstance = null;
  },

  // —— Human mode ——
  handleTileClick: (index) => {
    const { board, mode, isSolved, moves } = get();
    if (mode !== 'Human' || isSolved) return;
    const validMoves = getValidMoves(board);
    if (!validMoves.includes(index)) return;

    if (moves === 0) get()._startTimer();
    const newBoard = applyMove(board, index);
    const solved = isGoal(newBoard);
    set({ board: newBoard, moves: moves + 1, isSolved: solved });
    if (solved) { get()._stopTimer(); get()._updatePersonalBest(); }
  },

  // —— Private helpers ——
  _executeStep: () => {
    if (!algorithmInstance || algorithmInstance.done) {
      get()._stopAll();
      set({ isRunning: false, isPaused: false });
      return;
    }
    const result = algorithmInstance.step();

    // Show the board that was just processed (result.board is current node's board)
    const displayBoard = result.board || get().board;
    const newLog = result.board
      ? [...get().moveLog, { step: result.nodesExplored, board: result.board }]
      : get().moveLog;

    set({
      board: displayBoard,
      isSolved: result.done && !!result.path,
      aiStats: {
        nodesExplored: result.nodesExplored,
        frontierSize: result.frontierSize,
        pathLength: result.path ? result.path.length - 1 : null,
        timeMs: result.timeMs,
        f: result.f ?? null,
        g: result.g ?? null,
        h: result.h ?? null,
      },
      moveLog: newLog,
    });

    if (result.done) {
      get()._stopAll();
      set({ isRunning: false, isPaused: false });
      // Replay the solution path smoothly
      if (result.path && result.path.length > 1) {
        get()._replayPath(result.path);
      }
    }
  },

  _replayPath: (path) => {
    let i = 0;
    const playInterval = setInterval(() => {
      if (i >= path.length) { clearInterval(playInterval); return; }
      set({ board: path[i] });
      i++;
    }, 80);
  },

  _startInterval: () => {
    clearInterval(intervalId);
    const { speedIndex } = get();
    const ms = SPEED_PRESETS[speedIndex].ms;
    intervalId = setInterval(() => {
      get()._executeStep();
    }, ms);
  },

  _restartInterval: () => {
    clearInterval(intervalId);
    get()._startInterval();
  },

  _stopAll: () => {
    clearInterval(intervalId);
    clearInterval(timerIntervalId);
    intervalId = null;
    timerIntervalId = null;
  },

  _startTimer: () => {
    timerIntervalId = setInterval(() => {
      set(s => ({ timer: s.timer + 1 }));
    }, 1000);
  },

  _stopTimer: () => {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
  },

  _updatePersonalBest: () => {
    const { moves, timer, personalBest } = get();
    const isNewBest = !personalBest || moves < personalBest.moves ||
      (moves === personalBest.moves && timer < personalBest.timer);
    if (isNewBest) {
      const best = { moves, timer };
      localStorage.setItem('eightPuzzleBest', JSON.stringify(best));
      set({ personalBest: best });
    }
  },
}));
