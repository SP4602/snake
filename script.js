const canvas = document.getElementById("game-board");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const bestScoreElement = document.getElementById("best-score");
const messageElement = document.getElementById("message");
const startButton = document.getElementById("start-button");

const gridSize = 20;
const tileCount = canvas.width / gridSize;
const bestScoreKey = "snake-best-score";

let snake;
let direction;
let nextDirection;
let food;
let score;
let gameTimer = null;
let isRunning = false;

function getBestScore() {
  return Number(localStorage.getItem(bestScoreKey) || 0);
}

function setBestScore(value) {
  localStorage.setItem(bestScoreKey, String(value));
  bestScoreElement.textContent = value;
}

function resetGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  scoreElement.textContent = "0";
  messageElement.textContent = "游戏进行中";
  placeFood();
  draw();
}

function placeFood() {
  do {
    food = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
    };
  } while (snake.some((segment) => segment.x === food.x && segment.y === food.y));
}

function startGame() {
  if (gameTimer) {
    clearInterval(gameTimer);
  }

  resetGame();
  isRunning = true;
  gameTimer = setInterval(update, 120);
}

function endGame() {
  clearInterval(gameTimer);
  gameTimer = null;
  isRunning = false;
  messageElement.textContent = "游戏结束，点击按钮重新开始";

  const bestScore = getBestScore();
  if (score > bestScore) {
    setBestScore(score);
    messageElement.textContent = "新纪录，点击按钮再来一局";
  }
}

function update() {
  direction = nextDirection;

  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  const hitWall =
    head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount;
  const hitSelf = snake.some((segment) => segment.x === head.x && segment.y === head.y);

  if (hitWall || hitSelf) {
    endGame();
    draw();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 1;
    scoreElement.textContent = String(score);
    placeFood();
  } else {
    snake.pop();
  }

  draw();
}

function drawGrid() {
  ctx.strokeStyle = "rgba(120, 92, 66, 0.08)";
  ctx.lineWidth = 1;

  for (let i = 0; i <= tileCount; i += 1) {
    const position = i * gridSize;
    ctx.beginPath();
    ctx.moveTo(position, 0);
    ctx.lineTo(position, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, position);
    ctx.lineTo(canvas.width, position);
    ctx.stroke();
  }
}

function drawSnake() {
  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? "#166342" : "#2d8f61";
    ctx.fillRect(
      segment.x * gridSize + 1,
      segment.y * gridSize + 1,
      gridSize - 2,
      gridSize - 2
    );
  });
}

function drawFood() {
  const centerX = food.x * gridSize + gridSize / 2;
  const centerY = food.y * gridSize + gridSize / 2;

  ctx.fillStyle = "#d63d3d";
  ctx.beginPath();
  ctx.arc(centerX, centerY, gridSize / 2.8, 0, Math.PI * 2);
  ctx.fill();
}

function drawOverlay() {
  if (isRunning) {
    return;
  }

  ctx.fillStyle = "rgba(47, 36, 27, 0.18)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fffaf2";
  ctx.font = "bold 28px Trebuchet MS";
  ctx.textAlign = "center";
  ctx.fillText("点击开始游戏", canvas.width / 2, canvas.height / 2);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawFood();
  drawSnake();
  drawOverlay();
}

function handleDirectionChange(nextX, nextY) {
  if (!isRunning) {
    return;
  }

  const isReverse = nextX === -direction.x && nextY === -direction.y;
  if (!isReverse) {
    nextDirection = { x: nextX, y: nextY };
  }
}

document.addEventListener("keydown", (event) => {
  switch (event.key.toLowerCase()) {
    case "arrowup":
    case "w":
      handleDirectionChange(0, -1);
      break;
    case "arrowdown":
    case "s":
      handleDirectionChange(0, 1);
      break;
    case "arrowleft":
    case "a":
      handleDirectionChange(-1, 0);
      break;
    case "arrowright":
    case "d":
      handleDirectionChange(1, 0);
      break;
    default:
      break;
  }
});

startButton.addEventListener("click", startGame);

bestScoreElement.textContent = String(getBestScore());
resetGame();
