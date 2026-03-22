// ADFS — Iterative Deepening A* (IDA*)
// Uses iterative deepening with f-limit = g + h.
// Optimal like A*, but uses less memory.
// Modified to use an explicit stack to allow node-by-node UI animation.

import { getValidMoves, applyMove, isGoal, getManhattanDistance } from '../utils/puzzle.js';

export class ADFS {
  constructor() {
    this.threshold = 0;
    this.minFExceeded = Infinity;
    this.stack = [];
    this.nodesExplored = 0;
    this.solution = null;
    this.done = false;
    this.startTime = null;
    this.currentNode = null;
    this.startState = null;
  }

  init(startState) {
    this.startState = startState;
    this.threshold = getManhattanDistance(startState);
    this.minFExceeded = Infinity;
    this.stack = [{
      board: startState,
      g: 0,
      path: [startState],
      visited: new Set([startState.join(',')])
    }];
    this.nodesExplored = 0;
    this.solution = null;
    this.done = false;
    this.startTime = performance.now();
    this.currentNode = null;
  }

  step() {
    if (this.done) return this.buildResult(true, this.solution);

    // If stack is empty, we exhausted the current threshold. Increase it and restart.
    if (this.stack.length === 0) {
        this.threshold = this.minFExceeded;
        this.minFExceeded = Infinity;
        this.stack = [{
            board: this.startState,
            g: 0,
            path: [this.startState],
            visited: new Set([this.startState.join(',')])
        }];
        // return current state to show threshold bump without expanding a node
        return this.buildResult(false);
    }

    const node = this.stack.pop();
    const h = getManhattanDistance(node.board);
    const f = node.g + h;
    this.currentNode = { board: node.board, g: node.g, h, f };

    if (f > this.threshold) {
      this.minFExceeded = Math.min(this.minFExceeded, f);
      return this.buildResult(false);
    }

    this.nodesExplored++;

    if (isGoal(node.board)) {
      this.solution = node.path;
      this.done = true;
      return this.buildResult(true, node.path);
    }

    // reverse so we pop them in the correct forward order if desired
    const moves = getValidMoves(node.board).reverse();
    for (const moveIndex of moves) {
      const newBoard = applyMove(node.board, moveIndex);
      const key = newBoard.join(',');
      if (!node.visited.has(key)) {
        const newVisited = new Set(node.visited);
        newVisited.add(key);
        this.stack.push({
          board: newBoard,
          g: node.g + 1,
          path: [...node.path, newBoard],
          visited: newVisited
        });
      }
    }

    return this.buildResult(false);
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
      board: path ? path[path.length - 1] : (this.currentNode?.board || null),
      nodesExplored: this.nodesExplored,
      frontierSize: this.stack.length,
      done,
      path: path || null,
      f: this.currentNode?.f ?? null,
      g: this.currentNode?.g ?? null,
      h: this.currentNode?.h ?? null,
      threshold: this.threshold,
      timeMs: performance.now() - (this.startTime || performance.now()),
    };
  }

  getStats() {
    return {
      nodes: this.nodesExplored,
      frontier: this.stack.length,
      pathLength: this.solution ? this.solution.length - 1 : null,
      timeMs: performance.now() - (this.startTime || performance.now()),
      f: this.currentNode?.f ?? null,
      g: this.currentNode?.g ?? null,
      h: this.currentNode?.h ?? null,
    };
  }

  reset() {
    this.threshold = 0;
    this.minFExceeded = Infinity;
    this.stack = [];
    this.nodesExplored = 0;
    this.solution = null;
    this.done = false;
    this.currentNode = null;
    this.startState = null;
  }
}