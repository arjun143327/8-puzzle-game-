// BFS — Breadth-First Search
// Uses a FIFO queue. Explores all nodes level by level.
// Guaranteed to find the shortest path.
// PRD: AI-01 — must solve from any valid shuffled state.

import { getValidMoves, applyMove, isGoal } from '../utils/puzzle';

export class BFS {
  constructor() {
    this.queue = [];       // FIFO queue of { board, path }
    this.visited = new Set();
    this.nodesExplored = 0;
    this.solution = null;
    this.done = false;
    this.startTime = null;
  }

  init(startState) {
    this.queue = [{ board: startState, path: [startState] }];
    this.visited = new Set([startState.join(',')]);
    this.nodesExplored = 0;
    this.solution = null;
    this.done = false;
    this.startTime = performance.now();
  }

  step() {
    if (this.done || this.queue.length === 0) {
      this.done = true;
      return this.buildResult(true);
    }

    const { board, path } = this.queue.shift();
    this.nodesExplored++;

    if (isGoal(board)) {
      this.solution = path;
      this.done = true;
      return this.buildResult(true, path);
    }

    const moves = getValidMoves(board);
    for (const moveIndex of moves) {
      const newBoard = applyMove(board, moveIndex);
      const key = newBoard.join(',');
      if (!this.visited.has(key)) {
        this.visited.add(key);
        this.queue.push({ board: newBoard, path: [...path, newBoard] });
      }
    }

    return this.buildResult(false);
  }

  // Run entire algorithm at once (for Instant mode)
  solve(startState) {
    this.init(startState);
    while (!this.done) {
      const result = this.step();
      if (result.done) return result;
    }
    return this.buildResult(true, this.solution);
  }

  buildResult(done, path = null) {
    return {
      board: path ? path[path.length - 1] : (this.queue[0]?.board || null),
      nodesExplored: this.nodesExplored,
      frontierSize: this.queue.length,
      done,
      path: path || null,
      timeMs: performance.now() - (this.startTime || performance.now()),
    };
  }

  getStats() {
    return {
      nodes: this.nodesExplored,
      frontier: this.queue.length,
      pathLength: this.solution ? this.solution.length - 1 : null,
      timeMs: performance.now() - (this.startTime || performance.now()),
    };
  }

  reset() {
    this.queue = [];
    this.visited = new Set();
    this.nodesExplored = 0;
    this.solution = null;
    this.done = false;
  }
}
