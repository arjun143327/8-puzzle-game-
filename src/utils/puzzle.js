// GOAL STATE definition: classic 1-8 and 0 as blank
// [1, 2, 3]
// [4, 5, 6]
// [7, 8, 0]
export const GOAL_STATE = [1, 2, 3, 4, 5, 6, 7, 8, 0];

export const getValidMoves = (board) => {
  const blankIndex = board.indexOf(0);
  const row = Math.floor(blankIndex / 3);
  const col = blankIndex % 3;
  const moves = [];

  if (row > 0) moves.push(blankIndex - 3); // Up
  if (row < 2) moves.push(blankIndex + 3); // Down
  if (col > 0) moves.push(blankIndex - 1); // Left
  if (col < 2) moves.push(blankIndex + 1); // Right
  return moves;
};

export const applyMove = (board, targetIndex) => {
  const newBoard = [...board];
  const blankIndex = newBoard.indexOf(0);
  newBoard[blankIndex] = newBoard[targetIndex];
  newBoard[targetIndex] = 0;
  return newBoard;
};

export const getManhattanDistance = (board) => {
  let distance = 0;
  for (let i = 0; i < board.length; i++) {
    const value = board[i];
    if (value === 0) continue; // Ignore blank tile
    
    const targetIndex = GOAL_STATE.indexOf(value);
    const currentRow = Math.floor(i / 3);
    const currentCol = i % 3;
    const targetRow = Math.floor(targetIndex / 3);
    const targetCol = targetIndex % 3;
    
    distance += Math.abs(currentRow - targetRow) + Math.abs(currentCol - targetCol);
  }
  return distance;
};

export const countInversions = (board) => {
  let inversions = 0;
  for (let i = 0; i < board.length - 1; i++) {
    if (board[i] === 0) continue;
    for (let j = i + 1; j < board.length; j++) {
      if (board[j] !== 0 && board[i] > board[j]) {
        inversions++;
      }
    }
  }
  return inversions;
};

export const isSolvable = (board) => {
  return countInversions(board) % 2 === 0;
};

export const generatePuzzle = () => {
  let currentBoard = [...GOAL_STATE];
  let distance = 0;
  
  // Scramble until manhattan distance is at least 10 for complexity
  while (distance < 10) {
    // PRD: Apply N >= 50 random valid moves
    const NUM_SCRAMBLE_MOVES = 50 + Math.floor(Math.random() * 20);
    currentBoard = [...GOAL_STATE];
    let lastBlank = currentBoard.indexOf(0);
    
    for (let i = 0; i < NUM_SCRAMBLE_MOVES; i++) {
      const moves = getValidMoves(currentBoard);
      // Try to avoid immediately undoing the previous move
      const forwardMoves = moves.filter(m => m !== lastBlank);
      const chosenMoves = forwardMoves.length > 0 ? forwardMoves : moves;
      const randomMove = chosenMoves[Math.floor(Math.random() * chosenMoves.length)];
      
      lastBlank = currentBoard.indexOf(0);
      currentBoard = applyMove(currentBoard, randomMove);
    }
    
    distance = getManhattanDistance(currentBoard);
  }
  
  return currentBoard;
};

export const isGoal = (board) => {
  for (let i = 0; i < board.length; i++) {
    if (board[i] !== GOAL_STATE[i]) return false;
  }
  return true;
};
