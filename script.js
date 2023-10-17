/* ========================VARIABLES======================== */
const canvas = document.getElementById("gameZone");
const context = canvas.getContext("2d");

const fieldImg = new Image();
const baitImg = new Image();
fieldImg.src = "./assets/field.jpg";
baitImg.src = "./assets/strawberry-bait.png";

const cellSize = 25;
let currentScore = 0;

const btnStart = document.querySelector(".btn-start");
const btnResults = document.querySelector(".btn-results");

const score = document.querySelector(".score");
const yourScore = document.querySelector(".your-score");
const popupImg = document.querySelector(".popup-img");

const audioPlay = new Audio("./assets/audio-play.mp3");
const audioLose = new Audio("./assets/audio-lose.mp3");
const audioWin = new Audio("./assets/audio-win.mp3");
const audioPress = new Audio("./assets/audio-press.mp3");
const audioEating = new Audio("./assets/audio-eating.mp3");

const menuContentWrapper = document.querySelector(".menu-content-wrapper");
const resultsContentWrapper = document.querySelector(
  ".results-content-wrapper"
);
const btnBackToMenu = document.querySelector(".btn-back-to-menu");
const tableCells = document.querySelector(".table-cells");

const scoreTitle = document.querySelector(".score-title");
const bestTitle = document.querySelector(".best-title");

/* ========================LOCAL STORAGE======================== */
const saveResult = () => {
  const randomResults = JSON.parse(localStorage.getItem("sortResults")) || [];
  if (!randomResults.includes(currentScore)) {
    randomResults.push(currentScore);
  }
  const sortResults = randomResults.sort((a, b) => b - a).slice(0, 10);
  localStorage.setItem("sortResults", JSON.stringify(sortResults));
};

const showBest = () => {
  const bestResults = JSON.parse(localStorage.getItem("sortResults")) || [];
  bestTitle.textContent = `Best: ${bestResults[0] || 0}`;
};

const createTableCell = () => {
  tableCells.innerHTML = "";
  console.log(tableCells);
  const bestResults = JSON.parse(localStorage.getItem("sortResults")) || [];
  console.log(bestResults);
  bestResults.forEach((result) => {
    const tableCell = document.createElement("div");
    tableCell.textContent = `${result || 0}`;
    tableCells.appendChild(tableCell);
  });
};

/* ========================TOGGLE-VIEW======================== */

const showResults = () => {
  menuContentWrapper.classList.add("display-none");
  resultsContentWrapper.classList.remove("display-none");
  createTableCell();
};

const showMenu = () => {
  resultsContentWrapper.classList.add("display-none");
  menuContentWrapper.classList.remove("display-none");
};

/* ========================TOGGLE-POPUP======================== */
const popupOn = () => {
  document.querySelector("header").classList.add("popup-on");
};

const popupOff = () => {
  document.querySelector("header").classList.remove("popup-on");
};

/* ========================CURRENT-SCORE======================== */
const showCurrentScore = () => {
  yourScore.classList.remove("display-none");
  yourScore.textContent = `Your score: ${currentScore}`;
};

/* ========================LOSE======================== */
const showLose = () => {
  audioPlay.pause();
  audioLose.play();
  popupOn();
  popupImg.style.setProperty("background-image", "url(./assets/lose.png)");
  showCurrentScore();
  saveResult();
};

/* ========================WIN======================== */
const showWin = () => {
  audioPlay.pause();
  audioWin.play();
  popupOn();
  popupImg.style.setProperty(
    "background-image",
    "url(./assets/goblet-win.png)"
  );
  showCurrentScore();
  saveResult();
};

/* ========================LOSE-OR-WIN======================== */
const checkLoseOrWin = () => {
  const bestResults = JSON.parse(localStorage.getItem("sortResults")) || [];
  if (currentScore > bestResults[0]) {
    clearInterval(gameLoop);
    showWin();
  } else {
    clearInterval(gameLoop);
    showLose();
  }
};

/* ========================COORDINATES======================== */
const getRandomCoordinate = (max) => Math.floor(Math.random() * max) * cellSize;
const getBait = (length = 16) => ({
  x: getRandomCoordinate(length),
  y: getRandomCoordinate(length),
});
const getStartSnake = () => [
  {
    x: 8 * cellSize,
    y: 8 * cellSize,
  },
];

let bait;
let snake;

/* ========================COURSE======================== */
const courseVariants = ["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"];

let currentCourse;

document.addEventListener("keydown", (event) => {
  if (courseVariants.includes(event.key)) {
    currentCourse = event.key;
  }
});

/* ========================ELEMENTS======================== */
const showField = () => {
  context.drawImage(fieldImg, 0, 0);
};

const showBait = () => {
  context.drawImage(baitImg, bait.x, bait.y);
};

const showSnake = () => {
  for (let i = 0; i < snake.length; i++) {
    const color = i === 0 ? "#eeff86" : "white";
    context.fillStyle = color;
    context.fillRect(snake[i].x, snake[i].y, cellSize, cellSize);
  }
};

/* ========================UPDATE-SNAKE-POSITION======================== */
const updateSnakePosition = () => {
  let [snakeX, snakeY] = [snake[0].x, snake[0].y];

  if (snakeX === bait.x && snakeY === bait.y) {
    currentScore++;
    audioEating.play();
    scoreTitle.textContent = `Score: ${currentScore}`;
    bait = getBait();
  } else {
    snake.pop();
  }
  if (currentCourse === "ArrowLeft") snakeX -= cellSize;
  if (currentCourse === "ArrowUp") snakeY -= cellSize;
  if (currentCourse === "ArrowRight") snakeX += cellSize;
  if (currentCourse === "ArrowDown") snakeY += cellSize;

  const newHead = {
    x: snakeX,
    y: snakeY,
  };

  snake.unshift(newHead);
};

let gameLoop;

/* ========================COLLISION======================== */
const checkBoundaryCollision = () => {
  const [snakeX, snakeY] = [snake[0].x, snake[0].y];

  if (
    snakeX < 0 ||
    snakeY < 0 ||
    snakeX > cellSize * 15 ||
    snakeY > cellSize * 15
  ) {
    checkLoseOrWin();
  }
};

const isCollideWithTail = (head, tail) =>
  tail.slice(1).some((segment) => head.x === segment.x && head.y === segment.y);

const checkSelfCollision = () => {
  const newHead = snake[0];
  if (isCollideWithTail(newHead, snake)) {
    checkLoseOrWin();
  }
};

/* ========================GAME-PROCESS======================== */
const showGameProcess = () => {
  showField();
  showBait();
  showSnake();
  updateSnakePosition();
  checkBoundaryCollision();
  checkSelfCollision();
};

const startNewGame = () => {
  audioPlay.currentTime = 0;
  audioPlay.play();
  audioPlay.loop = true;
  currentCourse = null;
  currentScore = 0;
  scoreTitle.textContent = `Score: ${currentScore}`;
  bait = getBait();
  snake = getStartSnake();
  gameLoop = setInterval(showGameProcess, 200);
  showBest();
};

/* ========================BTN-EVENTS======================== */
btnStart.addEventListener("click", () => {
  audioPress.play();
  popupOff();
  startNewGame();
});

btnResults.addEventListener("click", () => {
  audioPress.play();
  showResults();
});

btnBackToMenu.addEventListener("click", () => {
  audioPress.play();
  showMenu();
});
