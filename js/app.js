
// Game Elements :
const WALL = 'WALL';
const FLOOR = 'FLOOR';
const BALL = 'BALL';
const GAMER = 'GAMER';
const GLUE = 'GLUE';

// images for elements: :
const GAMER_IMG = '<img src="img/gamer.png" />';
const BALL_IMG = '<img src="img/ball.png" />';
const GLUE_IMG = '<img src="img/glue.png" />'
const GLUED_GAMER_IMG = '<img src="img/gamer-purple.png" />';

// Global variables :
var gBoard;
var gGamerPos;
var gCollectedBallsCount = 0;
var gBallsCount = 2;
var gBallInterval = null;
var gGlueInterval = null;
var gIsGlued = false;
var gIsGameOn = true;


function initGame() {
	gGamerPos = { i: 2, j: 9 };
	gBoard = buildBoard();
	renderBoard(gBoard);
	gBallInterval = setInterval(addBall, 5000);
	gGlueInterval = setInterval(addGlue, 5000);
}

function resetGame() {
	gCollectedBallsCount = 0;
	gBallsCount = 2;
	gIsGlued = false;
	gIsGameOn = true;
	var elResetBtn = document.querySelector('.reset-btn');
	elResetBtn.style.display = 'none';
	initGame();
}

function buildBoard() {
	// Create the Matrix
	var board = createMat(10, 12)
	// Put FLOOR everywhere and WALL at edges
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			// Put FLOOR in a regular cell
			var cell = { type: FLOOR, gameElement: null };
			// Place Walls at edges
			if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
				cell.type = WALL;
			}
			// Add created cell to The game board
			board[i][j] = cell;
		}
	}
	// Place the passages
	board[0][5].type = FLOOR
	board[board.length - 1][5].type = FLOOR
	board[5][0].type = FLOOR
	board[5][board[0].length - 1].type = FLOOR
	// Place the gamer at selected position
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
	// Place the Balls (currently randomly chosen positions)
	board[3][8].gameElement = BALL;
	board[7][4].gameElement = BALL;

	// console.log(board);
	return board;
}

// Render the board to an HTML table
function renderBoard(board) {

	var strHTML = '';
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>';
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];

			var cellClass = getClassName({ i: i, j: j })
			cellClass += (currCell.type === FLOOR) ? ' floor' : ' wall';

			strHTML += `<td class="cell ${cellClass}"
			 onclick="moveTo('${i}','${j}')" >`;

			switch (currCell.gameElement) {
				case GAMER:
					strHTML += GAMER_IMG;
					break;
				case BALL:
					strHTML += BALL_IMG;
					break;
			}
			strHTML += '</td>';
		}
		strHTML += '</tr>';
	}
	var elBoard = document.querySelector('.board');
	elBoard.innerHTML = strHTML;
}

// Move the player to a specific location
function moveTo(i, j) {
	if (gIsGlued) return
	if (!gIsGameOn) return

	var targetCell = gBoard[i][j];
	if (targetCell.type === WALL) return;

	// Calculate distance to make sure we are moving to a neighbor cell
	var iAbsDiff = Math.abs(i - gGamerPos.i);
	var jAbsDiff = Math.abs(j - gGamerPos.j);

	// If the clicked Cell is one of the four allowed
	if ((iAbsDiff === 1 && jAbsDiff === 0) ||
		(jAbsDiff === 1 && iAbsDiff === 0) ||
		(iAbsDiff === gBoard.length - 1 && jAbsDiff === 0) ||
		(jAbsDiff === gBoard[0].length - 1 && iAbsDiff === 0)) {

		if (targetCell.gameElement === BALL) {
			updateBallsColected();
			playSound();
			checkGameOver();

		} else if (targetCell.gameElement === GLUE) {
			gIsGlued = true;
			setTimeout(function () {
				gIsGlued = false;
				renderCell(gGamerPos, GAMER_IMG)
			}, 3000);
		}

		// MOVING from current position
		// Model:
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
		// Dom:
		renderCell(gGamerPos, '');

		// MOVING to selected position
		// Model:
		gGamerPos.i = i;
		gGamerPos.j = j;
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
		// DOM:
		if (gIsGlued) renderCell(gGamerPos, GLUED_GAMER_IMG);
		else renderCell(gGamerPos, GAMER_IMG);

	} // else console.log('TOO FAR', iAbsDiff, jAbsDiff);

}

// Move the player by keyboard arrows
function handleKey(event) {

	var i = gGamerPos.i;
	var j = gGamerPos.j;

	switch (event.key) {
		case 'ArrowLeft':
			if (j === 0) moveTo(i, gBoard[0].length - 1);
			else moveTo(i, j - 1);
			break;
		case 'ArrowRight':
			if (j === gBoard[0].length - 1) moveTo(i, 0);
			else moveTo(i, j + 1);
			break;
		case 'ArrowUp':
			if (i === 0) moveTo(gBoard.length - 1, j);
			else moveTo(i - 1, j);
			break;
		case 'ArrowDown':
			if (i === gBoard.length - 1) moveTo(0, j);
			else moveTo(i + 1, j);
			break;
	}

}

function getEmptyCell() {
	var emptyCells = [];

	for (var i = 0; i < gBoard.length; i++) {
		for (var j = 0; j < gBoard[0].length; j++) {
			var currCell = gBoard[i][j];
			if (!currCell.gameElement && currCell.type === FLOOR) {
				var emptyCellPos = { i, j };
				emptyCells.push(emptyCellPos)
			}
		}
	}
	var randomIdx = getRandomInt(0, emptyCells.length)
	var emptyCell = emptyCells[randomIdx];
	return emptyCell
}

function addElement(element, elementImg) {
	var emptyCell = getEmptyCell()
	// Model:
	gBoard[emptyCell.i][emptyCell.j].gameElement = element;
	// DOM :
	renderCell(emptyCell, elementImg)
	return emptyCell

}

function addBall() {
	addElement(BALL, BALL_IMG)
	gBallsCount++;
}

function addGlue() {
	var emptyCell = addElement(GLUE, GLUE_IMG)
	setTimeout(removeGlue, 3000, emptyCell);
}

function removeGlue(emptyCell) {
	if (gBoard[emptyCell.i][emptyCell.j].gameElement !== GAMER) {
		// Model:
		gBoard[emptyCell.i][emptyCell.j].gameElement = null;
		// DOM :
		renderCell(emptyCell, '');
	}
}

function updateBallsColected() {
	// Model:
	gBallsCount--;
	gCollectedBallsCount++;
	// Dom:
	document.querySelector('h2 span').innerText = gCollectedBallsCount;
}

function checkGameOver() {
	if (!gBallsCount) gameOver();
}

function gameOver() {
	clearInterval(gBallInterval);
	clearInterval(gGlueInterval);
	var elResetBtn = document.querySelector('.reset-btn');
	elResetBtn.style.display = 'block';
	gIsGameOn = false;
}

// Returns the class name for a specific cell
function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j;
	return cellClass;
}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
	var cellSelector = '.' + getClassName(location)
	var elCell = document.querySelector(cellSelector);
	elCell.innerHTML = value;
}

function playSound() {
	var audio = new Audio('sounds/Ball Collected.wav');
	audio.play();
}

