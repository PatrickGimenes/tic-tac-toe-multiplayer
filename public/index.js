const socket = io();

let playerSymbol = null;

document
  .getElementById("btnX")
  .addEventListener("click", () => chooseSymbol("X"));
document
  .getElementById("btnO")
  .addEventListener("click", () => chooseSymbol("O"));

const boardContainer = document.getElementById("board");
const resultContainer = document.getElementById("result");

socket.on("symbolChosen", (symbol) => {
  playerSymbol = symbol;
  alert(`Você escolheu ${symbol}`);
});

socket.on("symbolNotAvailable", (message) => {
  alert(message);
  document.querySelectorAll("button").forEach((btn) => (btn.disabled = false));
});

socket.on("startGame", () => {
  document.getElementById("symbolSelection").style.display = "none";

  boardContainer.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    cell.addEventListener("click", () => makeMove(i));
    boardContainer.appendChild(cell);
  }
});

socket.on("updateBoard", (board) => {
  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell, index) => {
    cell.textContent = board[index];
  });
});

socket.on("yourTurn", () => {
  resultContainer.textContent = "Sua vez!";
  document
    .querySelectorAll(".cell")
    .forEach((cell) => (cell.style.pointerEvents = "auto"));
});

socket.on("gameOver", (message) => {
  resultContainer.textContent = message;
  document
    .querySelectorAll(".cell")
    .forEach((cell) => (cell.style.pointerEvents = "none"));
});

socket.on("waitingForPlayers", () => {
  resultContainer.textContent = "Esperando o outro jogador...";
});

function chooseSymbol(symbol) {
  socket.emit("chooseSymbol", symbol);
  document.querySelectorAll("button").forEach((btn) => (btn.disabled = true));
}

function makeMove(index) {
  socket.emit("makeMove", index);
}
