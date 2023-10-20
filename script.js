let fields = [
  null,   //0
  null,   //1
  null,   //2
  null,   //3
  null,   //4
  null,   //5
  null,   //6
  null,   //7
  null    //8
];

let currentPlayer = 'circle';

const WINNING_COMBINATIONS = [
[0, 1, 2], [3, 4, 5], [6, 7, 8], // horizontal
[0, 3, 6], [1, 4, 7], [2, 5, 8], // vertical
[0, 4, 8], [2, 4, 6] // diagonal
];

function init() {
  render();
}

function render() {
  const contentDiv = document.getElementById('content');

  let tableHtml = '<table>';
  for (let i = 0; i < 3; i++) {
      tableHtml += '<tr>';
      for (let j = 0; j < 3; j++) {
          const index = i * 3 + j;
          let symbol = '';
          if (fields[index] === 'circle') {
              symbol = generateCircleSVG();
          } else if (fields[index] === 'cross') {
              symbol = generateCrossSVG();
          }
          tableHtml += `<td onclick="handleClick(${index})">${symbol}</td>`;
      }
      tableHtml += '</tr>';
  }
  tableHtml += '</table>';

  contentDiv.innerHTML = tableHtml;
  
  const player1Container = document.getElementById('player1');
    const player2Container = document.getElementById('player2');

    if (currentPlayer === 'circle') {
        player1Container.classList.add('active');
        player2Container.classList.remove('active');
    } else {
        player1Container.classList.remove('active');
        player2Container.classList.add('active');
    }
    
    const player1SVG = generateCircleSVG();
    const player2SVG = generateCrossSVG();
    player1Container.innerHTML = player1SVG;
    player2Container.innerHTML = player2SVG;
}


function handleClick(index) {
  if (fields[index] === null && !isGameFinished()) {
      renderPlayers(); 
      fields[index] = currentPlayer;
      render();

      if (isGameFinished()) {
          const winCombination = getWinningCombination();
          drawWinningLine(winCombination);
      } else {
          currentPlayer = currentPlayer === 'circle' ? 'cross' : 'circle';
          if (currentPlayer === 'cross') {
              makeAiMove();
          }
      }
  }
}


function makeAiMove() {
  if (!isGameFinished()) {
    const bestMove = findBestMove(fields, 'cross');
    if (bestMove !== null) {
      const index = bestMove.index;
      handleClick(index);
    }
  }
}


function findBestMove(board, player) {
  if (isGameFinished(board)) {
    return evaluate(board);
  }

  const moves = [];
  const emptyCells = getEmptyCells(board);

  for (const index of emptyCells) {
    const move = {};
    move.index = index;
    board[index] = player;

    if (player === 'cross') {
      const result = findBestMove(board, 'cross');
      move.score = result.score;
    } else {
      const result = findBestMove(board, 'circle');
      move.score = result.score;
    }

    board[index] = null;
    moves.push(move);
  }

  let bestMove = null;
  if (player === 'cross') {
    let bestScore = -Infinity;
    for (const move of moves) {
      if (move.score > bestScore) {
        bestScore = move.score;
        bestMove = move;
      }
    }
  } else {
    let bestScore = Infinity;
    for (const move of moves) {
      if (move.score < bestScore) {
        bestScore = move.score;
        bestMove = move;
      }
    }
  }

  return bestMove;
}


function evaluate(board) {
  if (isWinning(board, 'cross')) {
    return { score: 1 };
  } else if (isWinning(board, 'circle')) {
    return { score: -1 };
  } else {
    return { score: 0 };
  }
}


function isWinning(board, player) {
  for (const combination of WINNING_COMBINATIONS) {
    const [a, b, c] = combination;
    if (board[a] === player && board[b] === player && board[c] === player) {
      return true;
    }
  }
  return false;
}


function getEmptyCells(board) {
  const emptyCells = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) {
      emptyCells.push(i);
    }
  }
  return emptyCells;
}


function renderPlayers() {
  const player1Container = document.getElementById('player1');
  const player2Container = document.getElementById('player2');

  if (currentPlayer === 'circle') {
      player1Container.classList.add('active');
      player2Container.classList.remove('active');
  } else {
      player1Container.classList.remove('active');
      player2Container.classList.add('active');
  }
}


function isGameFinished() {
  return fields.every((field) => field !== null) || getWinningCombination() !== null;
}


function restartGame(){
  fields = [
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
  ];
  render();
}


function getWinningCombination() {
  for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
      const [a, b, c] = WINNING_COMBINATIONS[i];
      if (fields[a] === fields[b] && fields[b] === fields[c] && fields[a] !== null) {
          return WINNING_COMBINATIONS[i];
      }
  }
  return null;
}


function generateCircleSVG() {
    const color = '#00B0EF';
    const width = 70;
    const height = 70;

    return `<svg width="${width}" height="${height}">
              <circle cx="35" cy="35" r="30" stroke="${color}" stroke-width="5" fill="none">
                <animate attributeName="stroke-dasharray" from="0 188.5" to="188.5 0" dur="0.4s" fill="freeze" />
              </circle>
            </svg>`;
}


function generateCrossSVG() {
    const color = '#FFC000';
    const width = 70;
    const height = 70;

    const svgHtml = `
      <svg width="${width}" height="${height}">
        <line x1="0" y1="0" x2="${width}" y2="${height}"
          stroke="${color}" stroke-width="5">
          <animate attributeName="x2" values="0; ${width}" dur="0.4s" />
          <animate attributeName="y2" values="0; ${height}" dur="0.4s" />
        </line>
        <line x1="${width}" y1="0" x2="0" y2="${height}"
          stroke="${color}" stroke-width="5">
          <animate attributeName="x2" values="${width}; 0" dur="0.4s" />
          <animate attributeName="y2" values="0; ${height}" dur="0.4s" />
        </line>
      </svg>
    `;

    return svgHtml;
}


function drawWinningLine(combination) {
  const lineColor = 'rgba(168, 167, 167, 0.623)';
  const lineWidth = 5;

  const startCell = document.querySelectorAll(`td`)[combination[0]];
  const endCell = document.querySelectorAll(`td`)[combination[2]];
  const startRect = startCell.getBoundingClientRect();
  const endRect = endCell.getBoundingClientRect();

  const contentRect = document.getElementById('content').getBoundingClientRect();

  const lineLength = Math.sqrt(
    Math.pow(endRect.left - startRect.left, 2) + Math.pow(endRect.top - startRect.top, 2)
  );
  const lineAngle = Math.atan2(endRect.top - startRect.top, endRect.left - startRect.left);

  const line = document.createElement('div');
  line.style.position = 'absolute';
  line.style.width = `${lineLength}px`;
  line.style.height = `${lineWidth}px`;
  line.style.backgroundColor = lineColor;
  line.style.top = `${startRect.top + startRect.height / 2 - lineWidth / 2 - contentRect.top}px`;
  line.style.left = `${startRect.left + startRect.width / 2 - contentRect.left}px`;
  line.style.transform = `rotate(${lineAngle}rad)`;
  line.style.transformOrigin = `top left`;
  document.getElementById('content').appendChild(line);
}