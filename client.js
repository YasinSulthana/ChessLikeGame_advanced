const ws = new WebSocket("ws://localhost:8080");
let gameState = null;
let selectedPiece = null;

ws.onmessage = function (event) {
  gameState = JSON.parse(event.data);
  updateBoard();
  updateMoveHistory();
};

function updateBoard() {
  const boardDiv = document.querySelector(".board");
  boardDiv.innerHTML = "";

  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const tile = document.createElement("div");
      tile.className = "tile";

      const player1Piece = gameState.pieces.player1.find(
        (p) => p.position[0] === row && p.position[1] === col
      );
      const player2Piece = gameState.pieces.player2.find(
        (p) => p.position[0] === row && p.position[1] === col
      );

      if (player1Piece) {
        const pieceDiv = document.createElement("div");
        pieceDiv.className = `piece player1`;
        pieceDiv.textContent = player1Piece.name;
        pieceDiv.onclick = () => selectPiece(player1Piece);
        tile.appendChild(pieceDiv);
      }

      if (player2Piece) {
        const pieceDiv = document.createElement("div");
        pieceDiv.className = `piece player2`;
        pieceDiv.textContent = player2Piece.name;
        pieceDiv.onclick = () => selectPiece(player2Piece);
        tile.appendChild(pieceDiv);
      }

      boardDiv.appendChild(tile);
    }
  }
}

function selectPiece(piece) {
  if (piece.player !== gameState.currentPlayer) return;

  selectedPiece = piece;
  document.getElementById(
    "selected-character"
  ).innerText = `Selected: ${piece.name}`;
}

function sendMove(direction) {
  if (!selectedPiece) return;

  const move = {
    player: gameState.currentPlayer,
    pieceName: selectedPiece.name,
    direction: direction,
  };

  ws.send(JSON.stringify(move));
}

function updateMoveHistory() {
  const historyDiv = document.getElementById("move-history");
  historyDiv.innerHTML = "Move History:<br>";

  gameState.moveHistory.forEach((move) => {
    historyDiv.innerHTML += `${move}<br>`;
  });
}
