let boxes = document.querySelectorAll(".box");
const socket = io();

let board = new Array(9).fill("");
let win = false;

let myRole = "";
let canPlay = false;

const statusText = document.getElementById("status");

//  Role
socket.on("playerRole", (role) => {
    myRole = role;
    statusText.textContent = `You are Player ${role}`;
});

//  Waiting
socket.on("waiting", () => {
    statusText.textContent = "Waiting for second player...";
    canPlay = false;
});

//  Start game
socket.on("startGame", () => {
    if (myRole === "O") {
        canPlay = true;
        statusText.textContent = "Your turn";
    } else {
        canPlay = false;
        statusText.textContent = "Opponent turn";
    }
});

// Click
boxes.forEach(box => {
    box.addEventListener("click", () => {

        let index = box.dataset.index;

        if (box.innerText === "" && !win && canPlay) {

            box.innerText = myRole;
            board[index] = myRole;

            canPlay = false;
            statusText.textContent = "Opponent turn";

            socket.emit("move", { index });

            checkWinner();
        }
    });
});

//  Receive move
socket.on("move", (data) => {
    let box = document.querySelector(`[data-index='${data.index}']`);

    if (box.innerText === "") {
        box.innerText = data.value;
        board[data.index] = data.value;

        checkWinner();

        if (data.value !== myRole) {
            canPlay = true;
            statusText.textContent = "Your turn";
        }
    }
});

//  Winner
let winningSet = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
];

function checkWinner() {
    for (let combo of winningSet) {
        let [a, b, c] = combo;

        if (
            board[a] &&
            board[a] === board[b] &&
            board[a] === board[c]
        ) {
            win = true;

            socket.emit("gameOver", board[a]);
            return;
        }
    }

    if (!board.includes("")) {
        setTimeout(() => {
            statusText.textContent = "Tie Game";
        }, 200);
    }
}

//  Sync winner
socket.on("gameOver", (winner) => {
    win = true;

    statusText.textContent = `Player ${winner} won 🎉`;
});

// Restart
function restart() {
    socket.emit("restart");
}

socket.on("restart", () => {
    location.reload();
});