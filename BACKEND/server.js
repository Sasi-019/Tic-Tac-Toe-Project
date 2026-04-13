const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);

const io = socketio(server, {
    cors: { origin: "*" }
});

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "../FRONTEND")));

let players = [];
let currentTurn = "O";

io.on("connection", (socket) => {

    if (players.length >= 2) {
        socket.emit("full");
        socket.disconnect();
        return;
    }

    let symbol = players.length === 0 ? "O" : "X";
    players.push({ id: socket.id, symbol });

    socket.emit("playerRole", symbol);

    if (players.length === 1) {
        socket.emit("waiting");
    }

    if (players.length === 2) {
        currentTurn = "O";
        io.emit("startGame");
    }

    socket.on("move", (data) => {
        const player = players.find(p => p.id === socket.id);

        if (!player || player.symbol !== currentTurn) return;

        io.emit("move", {
            index: data.index,
            value: player.symbol
        });

        currentTurn = currentTurn === "O" ? "X" : "O";
    });

    socket.on("gameOver", (winner) => {
        io.emit("gameOver", winner);
    });

    socket.on("restart", () => {
        currentTurn = "O";
        io.emit("restart");
    });

    socket.on("disconnect", () => {
        players = players.filter(p => p.id !== socket.id);
        currentTurn = "O";
        io.emit("waiting");
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});