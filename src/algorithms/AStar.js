// A* Search
// Uses f(n) = g(n) + h(n) where h is Manhattan Distance.
// Always finds the optimal (shortest) path.
// PRD: Must expose f, g, h values per node in stats panel.

import { getValidMoves, applyMove, isGoal, getManhattanDistance } from '../utils/puzzle';

class MinHeap {
  constructor() { this.heap = []; }

  push(item) {
    this.heap.push(item);
    this._bubbleUp(this.heap.length - 1);
  }

  pop() {
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._sinkDown(0);
    }
    return top;
  }

  get size() { return this.heap.length; }

  _bubbleUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent].f <= this.heap[i].f) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }

  _sinkDown(i) {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.heap[l].f < this.heap[smallest].f) smallest = l;
      if (r < n && this.heap[r].f < this.heap[smallest].f) smallest = r;
      if (smallest === i) break;
      [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
      i = smallest;
    }
  }
}

export class AStar {
  constructor() {
    this.openList = new MinHeap();
    this.visited = new Map(); // key → lowest g seen
    this.nodesExplored = 0;
    this.solution = null;
    this.done = false;
    this.startTime = null;
    this.currentNode = null;
  }

  init(startState) {
    this.openList = new MinHeap();
    this.visited = new Map();
    this.nodesExplored = 0;
    this.solution = null;
    this.done = false;
    this.startTime = performance.now();

    const h = getManhattanDistance(startState);
    this.openList.push({ board: startState, g: 0, h, f: h, path: [startState] });
    this.currentNode = null;
  }

  step() {
    if (this.done || this.openList.size === 0) {
      this.done = true;
      return this.buildResult(true, this.solution);
    }

    const node = this.openList.pop();
    this.currentNode = node;
    const key = node.board.join(',');

    // Skip if we've seen this state with a lower cost
    if (this.visited.has(key) && this.visited.get(key) <= node.g) {
      return this.buildResult(false);
    }
    this.visited.set(key, node.g);
    this.nodesExplored++;

    if (isGoal(node.board)) {
      this.solution = node.path;
      this.done = true;
      return this.buildResult(true, node.path, node);
    }

    const moves = getValidMoves(node.board);
    for (const moveIndex of moves) {
      const newBoard = applyMove(node.board, moveIndex);
      const newKey = newBoard.join(',');
      const newG = node.g + 1;

      if (!this.visited.has(newKey) || this.visited.get(newKey) > newG) {
        const h = getManhattanDistance(newBoard);
        this.openList.push({
          board: newBoard,
          g: newG,
          h,
          f: newG + h,
          path: [...node.path, newBoard],
        });
      }
    }

    return this.buildResult(false, null, node);
  }

  solve(startState) {
    this.init(startState);
    while (!this.done && this.openList.size > 0) {
      const result = this.step();
      if (result.done) return result;
    }
    return this.buildResult(true, this.solution);
  }

  buildResult(done, path = null, node = null) {
    return {
      board: path ? path[path.length - 1] : (node?.board || null),
      nodesExplored: this.nodesExplored,
      frontierSize: this.openList.size,
      done,
      path: path || null,
      f: node?.f ?? null,
      g: node?.g ?? null,
      h: node?.h ?? null,
      timeMs: performance.now() - (this.startTime || performance.now()),
    };
  }

  getStats() {
    return {
      nodes: this.nodesExplored,
      frontier: this.openList.size,
      pathLength: this.solution ? this.solution.length - 1 : null,
      timeMs: performance.now() - (this.startTime || performance.now()),
      f: this.currentNode?.f ?? null,
      g: this.currentNode?.g ?? null,
      h: this.currentNode?.h ?? null,
    };
  }

  reset() {
    this.openList = new MinHeap();
    this.visited = new Map();
    this.nodesExplored = 0;
    this.solution = null;
    this.done = false;
    this.currentNode = null;
  }
}
