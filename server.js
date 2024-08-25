// server.js
const WebSocket = require("ws");
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let initialGameState = {
  board: [
    ["A-P1", "A-P2", "A-H1", "A-H2", "A-P3"],
    [null, null, null, null, null],
    [null, null, null, null, null],
    [null, null, null, null, null],
    ["B-P1", "B-P2", "B-H1", "B-H2", "B-P3"],
  ],
  currentPlayer: "player1",
  moveHistory: [],
};

let gameState = { ...initialGameState };

// Serve static files (like index.html) from the public folder
app.use(express.static("public"));

// Handle WebSocket connections
wss.on("connection", (ws) => {
  // Send the current game state to the newly connected client
  ws.send(JSON.stringify({ gameState }));

  ws.on("message", (message) => {
    const request = JSON.parse(message);

    if (request.newGame) {
      resetGame();
    } else {
      processMove(request);
    }

    // Broadcast the updated game state to all clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ gameState }));
      }
    });
  });
});

// Reset the game state
function resetGame() {
  gameState = { ...initialGameState };
}

// Core game logic
function processMove(move) {
  const { player, pieceName, direction } = move;

  if (player !== gameState.currentPlayer) return;

  // Find the piece position on the board
  let piecePosition = null;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      if (gameState.board[row][col] === pieceName) {
        piecePosition = { row, col };
        break;
      }
    }
    if (piecePosition) break;
  }

  if (!piecePosition) return;

  let newRow = piecePosition.row;
  let newCol = piecePosition.col;

  switch (direction) {
    case "L":
      newCol -= 1;
      break;
    case "R":
      newCol += 1;
      break;
    case "F":
      newRow += currentPlayer === "player1" ? 1 : -1;
      break; // Forward: Player 1 moves downwards, Player 2 moves upwards
    case "B":
      newRow -= currentPlayer === "player1" ? 1 : -1;
      break; // Backward: Player 1 moves upwards, Player 2 moves downwards
    case "FL":
      newRow += currentPlayer === "player1" ? 1 : -1;
      newCol -= 1;
      break; // Forward-Left
    case "FR":
      newRow += currentPlayer === "player1" ? 1 : -1;
      newCol += 1;
      break; // Forward-Right
    case "BL":
      newRow -= currentPlayer === "player1" ? 1 : -1;
      newCol -= 1;
      break; // Backward-Left
    case "BR":
      newRow -= currentPlayer === "player1" ? 1 : -1;
      newCol += 1;
      break; // Backward-Right
  }

  // Ensure the new position is within bounds and is either empty or occupied by the opponent's piece
  if (
    newRow >= 0 &&
    newRow < 5 &&
    newCol >= 0 &&
    newCol < 5 &&
    (gameState.board[newRow][newCol] === null ||
      gameState.board[newRow][newCol][0] !== player[0])
  ) {
    if (gameState.board[newRow][newCol]) {
      gameState.moveHistory.push(
        `${pieceName} captured ${gameState.board[newRow][newCol]}`
      );
    } else {
      gameState.moveHistory.push(`${pieceName} moved ${direction}`);
    }

    // Move the piece
    gameState.board[newRow][newCol] = pieceName;
    gameState.board[piecePosition.row][piecePosition.col] = null;

    // Switch turn
    gameState.currentPlayer =
      gameState.currentPlayer === "player1" ? "player2" : "player1";
  }
}

// Start the server
server.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
