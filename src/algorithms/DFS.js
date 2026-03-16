// DFS — Depth-First Search
// Uses a LIFO stack. Explores deep paths first, then backtracks.
// NOT guaranteed to find shortest path.
// PRD: AI-05 — must have configurable depth limit (default 50).

import { getValidMoves, applyMove, isGoal } from '../utils/puzzle';

export class DFS {
  constructor(depthLimit = 50) {
    this.depthLimit = depthLimit;
    this.stack = [];
    this.nodesExplored = 0;
    this.solution = null;
    this.done = false;
    this.startTime = null;
  }

  init(startState) {
    this.stack = [{ board: startState, path: [startState], visited: new Set([startState.join(',')]) }];
    this.nodesExplored = 0;
    this.solution = null;
    this.done = false;
    this.startTime = performance.now();
  }

  step() {
    if (this.done || this.stack.length === 0) {
      this.done = true;
      return this.buildResult(true, this.solution);
    }

    const { board, path, visited } = this.stack.pop();
    this.nodesExplored++;

    if (isGoal(board)) {
      this.solution = path;
      this.done = true;
      return this.buildResult(true, path);
    }

    if (path.length - 1 >= this.depthLimit) {
      return this.buildResult(false);
    }

    const moves = getValidMoves(board);
    for (const moveIndex of moves) {
      const newBoard = applyMove(board, moveIndex);
      const key = newBoard.join(',');
      if (!visited.has(key)) {
        const newVisited = new Set(visited);
        newVisited.add(key);
        this.stack.push({ board: newBoard, path: [...path, newBoard], visited: newVisited });
      }
    }

    return this.buildResult(false);
  }

  solve(startState) {
    this.init(startState);
    while (!this.done && this.stack.length > 0) {
      const result = this.step();
      if (result.done) return result;
    }
    return this.buildResult(true, this.solution);
  }

  buildResult(done, path = null) {
    const currentBoard = this.stack.length > 0
      ? this.stack[this.stack.length - 1].board
      : null;
    return {
      board: path ? path[path.length - 1] : currentBoard,
      nodesExplored: this.nodesExplored,
      frontierSize: this.stack.length,
      depth: this.stack.length > 0 ? this.stack[this.stack.length - 1].path.length - 1 : 0,
      done,
      path: path || null,
      timeMs: performance.now() - (this.startTime || performance.now()),
    };
  }

  getStats() {
    return {
      nodes: this.nodesExplored,
      frontier: this.stack.length,
      pathLength: this.solution ? this.solution.length - 1 : null,
      timeMs: performance.now() - (this.startTime || performance.now()),
      depth: this.stack.length > 0 ? this.stack[this.stack.length - 1].path.length - 1 : 0,
    };
  }

  reset() {
    this.stack = [];
    this.nodesExplored = 0;
    this.solution = null;
    this.done = false;
  }

  setDepthLimit(limit) {
    this.depthLimit = limit;
  }
}
