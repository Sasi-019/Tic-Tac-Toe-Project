let boxes = document.querySelectorAll(".box");
const socket = io();

let arrayIndex = new Array(9).fill("");
let turn = 0;
let win = false;

let myRole = "";
let canPlay = false; //  controls turn

const body = document.querySelector("body");
const player = document.querySelector("#player");


//  receive player role
socket.on("playerRole", (role) => {
    myRole = role;
    console.log("My role:", role);

    // Player O starts first
    if (role === "O") {
        canPlay = true;
    }
});


//  CLICK HANDLER
boxes.forEach(box => {
    box.addEventListener("click", () => {

        if (
            box.innerText === "" &&
            win === false &&
            canPlay === true
        ) {
            let index = box.dataset.index;
            let output = "";

            turn++;

            if (turn % 2 === 1) {
                output = "O";
            } else {
                output = "X";
            }

            box.innerText = output;

            //  lock current player
            canPlay = false;

            //  send move to server
            socket.emit("move", {
                index: index,
                value: output
            });

            winner(index, output, turn);
        }
    });
});


//  RECEIVE MOVE FROM SERVER
socket.on("move", (data) => {
    let box = document.querySelector(`[data-index='${data.index}']`);

    if (box.innerText === "") {
        box.innerText = data.value;

        turn++;
        winner(data.index, data.value, turn);

        //  allow this player to play now
        canPlay = true;
    }
});


// WIN LOGIC
let winningSet = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
];

function winner(x, y, turn) {
    arrayIndex[x] = y;

    for (let i = 0; i < 8; i++) {
        if (
            arrayIndex[winningSet[i][0]] !== "" &&
            arrayIndex[winningSet[i][0]] === arrayIndex[winningSet[i][1]] &&
            arrayIndex[winningSet[i][1]] === arrayIndex[winningSet[i][2]]
        ) {
            win = true;

            //  notify server
            socket.emit("gameOver", y);

            setTimeout(() => {
                alert(`Player ${y} won`);
            }, 500);
        }

        if (turn === 9 && win === false) {
            setTimeout(() => {
                alert("Tie");
            }, 500);
        }

        if (turn % 2 === 0) {
            player.textContent = "Player O playing";
        } else {
            player.textContent = "Player X playing";
        }
    }
}


//  SYNC WINNER ON BOTH SCREENS
socket.on("gameOver", (winner) => {
    win = true;

    setTimeout(() => {
        body.innerHTML = `
            <p>Player ${winner} won</p>
            <button onclick="restart()">RESTART</button>
        `;
    }, 500);
});


function restart() {
    location.reload();
}