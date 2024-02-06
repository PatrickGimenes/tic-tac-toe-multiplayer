const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

let players = [];
let currentPlayer = null;
let board = Array(9).fill(null);

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("chooseSymbol", (symbol) => {
    if (players.length < 2) {
      // Verificar se o símbolo ainda está disponível
      const symbolIsAvailable = !players.some(
        (player) => player.symbol === symbol
      );

      if (symbolIsAvailable) {
        players.push({ id: socket.id, symbol });
        socket.emit("symbolChosen", symbol);

        if (players.length === 2) {
          io.emit("startGame");
          currentPlayer = players[0].id;
          io.to(currentPlayer).emit("yourTurn");
        }
      } else {
        // Informar ao cliente que o símbolo escolhido não está disponível
        socket.emit(
          "symbolNotAvailable",
          "Este símbolo já foi escolhido. Por favor, escolha outro."
        );
      }
    }
  });

  socket.on("makeMove", (index) => {
    if (socket.id === currentPlayer && !board[index]) {
      board[index] = players.find((player) => player.id === socket.id).symbol;
      io.emit("updateBoard", board);

      if (checkWinner()) {
        io.emit("gameOver", `${getCurrentPlayerSymbol()} ganhou!`);
      } else if (board.every((cell) => cell !== null)) {
        io.emit("gameOver", "It's a draw!");
      } else {
        currentPlayer =
          currentPlayer === players[0].id ? players[1].id : players[0].id;
        io.to(currentPlayer).emit("yourTurn");
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
    players = players.filter((player) => player.id !== socket.id);

    if (players.length < 2) {
      io.emit("waitingForPlayers");
      currentPlayer = null;
      board = Array(9).fill(null);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

function checkWinner() {
  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // Rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // Columns
    [0, 4, 8],
    [2, 4, 6], // Diagonals
  ];

  for (const combination of winningCombinations) {
    const [a, b, c] = combination;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return true;
    }
  }

  return false;
}

function getCurrentPlayerSymbol() {
  return players.find((player) => player.id === currentPlayer).symbol;
}
