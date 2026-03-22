// ADFS — Hybrid A*-DFS (Adaptive DFS)
// Based on: "A Novel Hybrid A*-DFS Algorithm for 8-Puzzle"
//
// Algorithm overview:
//   - Main driver: A* priority queue (min-heap by f = g + h)
//   - Every k=5 node expansions → trigger depth-limited DFS burst (depth d=10)
//     from the current node
//   - DFS burst finds "promising" nodes where h(node) < h(current)
//     and injects them into the A* open list
//   - A single GLOBAL closed set (shared across all steps) prevents re-expansion
//   - Resume A* after each burst
//
// Expected: 9–75 nodes explored for most puzzles (vs A*'s 71–887, IDA*'s 2000+)

import { getValidMoves, applyMove, isGoal, getManhattanDistance } from '../utils/puzzle.js';

// ── Min-Heap ordered by f(n) ──────────────────────────────────────────────────
class MinHeap {
  constructor() { this.heap = []; }

  push(item) {
    this.heap.push(item);
    this._up(this.heap.length - 1);
  }

  pop() {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._down(0);
    }
    return top;
  }

  get size() { return this.heap.length; }

  _up(i) {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.heap[p].f <= this.heap[i].f) break;
      [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];
      i = p;
    }
  }

  _down(i) {
    const n = this.heap.length;
    while (true) {
      let s = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.heap[l].f < this.heap[s].f) s = l;
      if (r < n && this.heap[r].f < this.heap[s].f) s = r;
      if (s === i) break;
      [this.heap[i], this.heap[s]] = [this.heap[s], this.heap[i]];
      i = s;
    }
  }
}
// ─────────────────────────────────────────────────────────────────────────────

export class ADFS {
  constructor() {
    this.K = 5;   // run DFS burst every K expansions
    this.D = 10;  // DFS burst depth limit
    this.openList = new MinHeap();
    this.closed = new Set();          // GLOBAL closed set — shared across all steps
    this.nodesExplored = 0;
    this.expansionCount = 0;
    this.solution = null;
    this.done = false;
    this.startTime = null;
    this.currentNode = null;
  }

  init(startState) {
    this.openList = new MinHeap();
    this.closed = new Set();
    this.nodesExplored = 0;
    this.expansionCount = 0;
    this.solution = null;
    this.done = false;
    this.startTime = performance.now();
    this.currentNode = null;

    const h = getManhattanDistance(startState);
    this.openList.push({ board: startState, g: 0, h, f: h, path: [startState] });
  }

  // DFS burst from `node` to depth `depthLeft`.
  // Returns all "promising" nodes encountered: those whose h < node.h.
  // Uses the global closed set to avoid re-exploring already-settled states.
  _dfsBurst(node, depthLeft, visited, promising) {
    if (depthLeft === 0) return;

    const moves = getValidMoves(node.board);
    for (const moveIndex of moves) {
      const newBoard = applyMove(node.board, moveIndex);
      const key = newBoard.join(',');

      if (this.closed.has(key) || visited.has(key)) continue;

      const h = getManhattanDistance(newBoard);
      const newG = node.g + 1;
      const f = newG + h;

      // "Promising" = gets us closer to the goal than the burst's starting node
      if (h < node.h) {
        promising.push({ board: newBoard, g: newG, h, f, path: [...node.path, newBoard] });
      }

      visited.add(key);
      this._dfsBurst(
        { board: newBoard, g: newG, h, f, path: [...node.path, newBoard] },
        depthLeft - 1,
        visited,
        promising
      );
      visited.delete(key); // backtrack so sibling branches can visit this state
    }
  }

  step() {
    if (this.done) return this.buildResult(true, this.solution);

    // If open list is empty, search failed (unsolvable from current state)
    if (this.openList.size === 0) {
      this.done = true;
      return this.buildResult(true, null);
    }

    // 1. Pop the best-f node from the A* open list
    const node = this.openList.pop();
    const key = node.board.join(',');

    // Lazy-deletion: if already closed, skip without counting as an expansion
    if (this.closed.has(key)) {
      return this.buildResult(false);
    }

    // 2. Close this node (add to global closed set when POPPED, per paper)
    this.closed.add(key);
    this.currentNode = node;
    this.nodesExplored++;
    this.expansionCount++;

    // 3. Goal check
    if (isGoal(node.board)) {
      this.solution = node.path;
      this.done = true;
      return this.buildResult(true, node.path);
    }

    // 4. Every K expansions → run synchronous DFS burst
    if (this.expansionCount % this.K === 0) {
      const promising = [];
      const burstVisited = new Set([key]); // prevent burst from cycling back to current
      this._dfsBurst(node, this.D, burstVisited, promising);

      // Inject promising nodes into the A* open list (if not already closed)
      for (const pNode of promising) {
        if (!this.closed.has(pNode.board.join(','))) {
          this.openList.push(pNode);
        }
      }
    }

    // 5. Regular A* neighbor expansion
    const moves = getValidMoves(node.board);
    for (const moveIndex of moves) {
      const newBoard = applyMove(node.board, moveIndex);
      const newKey = newBoard.join(',');
      if (!this.closed.has(newKey)) {
        const newG = node.g + 1;
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

    return this.buildResult(false);
  }

  solve(startState) {
    this.init(startState);
    while (!this.done) {
      const result = this.step();
      if (result.done) return result;
      if (this.openList.size === 0 && !this.done) break;
    }
    return this.buildResult(true, this.solution);
  }

  buildResult(done, path = null) {
    return {
      board: path ? path[path.length - 1] : (this.currentNode?.board || null),
      nodesExplored: this.nodesExplored,
      frontierSize: this.openList.size,
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
    this.closed = new Set();
    this.nodesExplored = 0;
    this.expansionCount = 0;
    this.solution = null;
    this.done = false;
    this.currentNode = null;
  }
}