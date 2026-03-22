// Test script to verify algorithms
import { BFS } from './src/algorithms/BFS.js';
import { DFS } from './src/algorithms/DFS.js';
import { AStar } from './src/algorithms/AStar.js';
import { generatePuzzle, isSolvable } from './src/utils/puzzle.js';

// Simple test: start from goal, should find path of length 0
const goal = [1,2,3,4,5,6,7,8,0];

console.log('Testing algorithms on goal state:');
console.log('Goal:', goal);

const bfs = new BFS();
const resultBFS = bfs.solve(goal);
console.log('BFS:', resultBFS);

const dfs = new DFS();
const resultDFS = dfs.solve(goal);
console.log('DFS:', resultDFS);

const astar = new AStar();
const resultAStar = astar.solve(goal);
console.log('A*:', resultAStar);

// Test on a simple puzzle: one move away
const oneMove = [1,2,3,4,5,6,7,0,8]; // blank and 8 swapped
console.log('\nTesting on one move away:');
console.log('Start:', oneMove);

const bfs2 = new BFS();
const resultBFS2 = bfs2.solve(oneMove);
console.log('BFS path length:', resultBFS2.path ? resultBFS2.path.length - 1 : 'none');

const dfs2 = new DFS();
const resultDFS2 = dfs2.solve(oneMove);
console.log('DFS path length:', resultDFS2.path ? resultDFS2.path.length - 1 : 'none');

const astar2 = new AStar();
const resultAStar2 = astar2.solve(oneMove);
console.log('A* path length:', resultAStar2.path ? resultAStar2.path.length - 1 : 'none');