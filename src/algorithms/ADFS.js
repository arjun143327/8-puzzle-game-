// ADFS — Iterative Deepening A*
// Uses iterative deepening with f-limit = g + h.
// Optimal like A*, but uses less memory.
// PRD: Must expose f, g, h values per node in stats panel.

import { getValidMoves, applyMove, isGoal, getManhattanDistance } from '../utils/puzzle.js';

export class ADFS {
  constructor() {
    this.currentThreshold = 0;
    this.nodesExplored = 0;
    this.solution = null;
    this.done = false;
    this.startTime = null;
    this.currentNode = null;
    this.minFExceeded = Infinity;
  }

  init(startState) {
    this.startState = startState;
    this.currentThreshold = getManhattanDistance(startState);
    this.nodesExplored = 0;
    this.solution = null;
    this.done = false;
    this.startTime = performance.now();
    this.currentNode = null;
    this.minFExceeded = Infinity;
  }

  dfs(board, g, path, visited, threshold) {
    const h = getManhattanDistance(board);
    const f = g + h;
    this.currentNode = { board, g, h, f };

    if (f > threshold) {
      this.minFExceeded = Math.min(this.minFExceeded, f);
      return { found: false };
    }

    this.nodesExplored++;

    if (isGoal(board)) {
      return { found: true, path: [...path, board] };
    }

    const moves = getValidMoves(board);
    for (const moveIndex of moves) {
      const newBoard = applyMove(board, moveIndex);
      const key = newBoard.join(',');
      if (!visited.has(key)) {
        visited.add(key);
        const result = this.dfs(newBoard, g + 1, [...path, board], visited, threshold);
        if (result.found) return result;
        visited.delete(key); // backtrack
      }
    }

    return { found: false };
  }

  step() {
    if (this.done) {
      return this.buildResult(true, this.solution);
    }

    const visited = new Set();
    visited.add(this.currentNode ? this.currentNode.board.join(',') : ''); // but since start

    // Actually, for IDA*, start from scratch each time, but with increasing threshold
    // But to fit, perhaps assume startState is fixed, but since init has startState, but in step, I need the startState.

    // Problem: in step, I don't have the startState.

    // In the other algorithms, init takes startState, and step uses it.

    // For IDA*, I need to store the startState.

    // Let's modify.

    // Add this.startState in init.

    // Yes.

    // In init, this.startState = startState;

    // Then in step, const result = this.dfs(this.startState, 0, [], new Set(), this.currentThreshold);

    // If result.found, this.solution = result.path, this.done = true, return buildResult(true, result.path)

    // Else, this.currentThreshold = this.minFExceeded, this.minFExceeded = Infinity, return buildResult(false)

    // But in dfs, I set this.minFExceeded.

    // But for each step, reset minFExceeded.

    // Yes.

    // Also, for frontierSize, perhaps 0, since no open list.

    // For currentNode, set in dfs.

    // Yes.

    // But in dfs, I set this.currentNode to the last node explored or something.

    // Perhaps set when checking f > threshold or at goal.

    // But to make it simple.

    // Also, for buildResult, when not done, board is null or something.

    // Let's adjust.

    // In step:

    this.minFExceeded = Infinity;

    const result = this.dfs(this.startState, 0, [], new Set([this.startState.join(',')]), this.currentThreshold);

    if (result.found) {
      this.solution = result.path;
      this.done = true;
      return this.buildResult(true, result.path);
    } else {
      this.currentThreshold = this.minFExceeded;
      return this.buildResult(false);
    }

  }

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
      board: path ? path[path.length - 1] : null,
      nodesExplored: this.nodesExplored,
      frontierSize: 0, // no open list
      done,
      path: path || null,
      f: this.currentNode?.f ?? null,
      g: this.currentNode?.g ?? null,
      h: this.currentNode?.h ?? null,
      timeMs: performance.now() - (this.startTime || performance.now()),
    };
  }

  getStats() {
    return {
      nodes: this.nodesExplored,
      frontier: 0,
      pathLength: this.solution ? this.solution.length - 1 : null,
      timeMs: performance.now() - (this.startTime || performance.now()),
      f: this.currentNode?.f ?? null,
      g: this.currentNode?.g ?? null,
      h: this.currentNode?.h ?? null,
    };
  }

  reset() {
    this.currentThreshold = 0;
    this.nodesExplored = 0;
    this.solution = null;
    this.done = false;
    this.currentNode = null;
    this.minFExceeded = Infinity;
  }
}