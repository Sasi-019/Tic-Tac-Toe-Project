const express = require("express");
const http = require("http");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);

// Enable CORS (important if frontend is deployed separately)
const io = socketio(server, {
    cors: {
        origin: "*"
    }
});

const PORT = process.env.PORT || 3000;

app.use(express.static("../FRONTEND"));

let players = [];
let currentTurn = "O"; // Track turn

io.on("connection", (socket) => {

    // ❌ Limit to 2 players
    if (players.length >= 2) {
        socket.emit("full");
        socket.disconnect();
        return;
    }

    // ✅ Assign symbol
    let symbol = players.length === 0 ? "O" : "X";
    players.push({ id: socket.id, symbol });

    socket.emit("playerRole", symbol);
    console.log("Player connected:", symbol);

    // ✅ Start game when 2 players join
    if (players.length === 2) {
        currentTurn = "O"; // reset turn
        io.emit("startGame");
    }

    // ✅ Handle move with turn validation
    socket.on("move", (data) => {
        const player = players.find(p => p.id === socket.id);

        // ❌ Invalid move (wrong player turn)
        if (!player || player.symbol !== currentTurn) return;

        // ✅ Broadcast move
        io.emit("move", data);

        // 🔄 Switch turn
        currentTurn = currentTurn === "O" ? "X" : "O";
    });

    // ✅ Restart game
    socket.on("restart", () => {
        currentTurn = "O";
        io.emit("restart");
    });

    // ✅ Handle disconnect
    socket.on("disconnect", () => {
        console.log("User disconnected");

        // Remove player
        players = players.filter(p => p.id !== socket.id);

        // Reassign symbols correctly
        players.forEach((p, index) => {
            p.symbol = index === 0 ? "O" : "X";
            io.to(p.id).emit("playerRole", p.symbol);
        });

        // Reset game state
        currentTurn = "O";

        // Notify remaining player
        io.emit("waiting");
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});