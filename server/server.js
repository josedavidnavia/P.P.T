const express = require('express');
const { WebSocketServer } = require('ws');

const app = express();
const port = 3000;

let players = [];
let gameState = {
    player1: null,
    player2: null,
    player1Score: 0,
    player2Score: 0
};

app.use(express.static('client'));

const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    if (players.length >= 2) {
        ws.send(JSON.stringify({ type: 'error', message: 'Game is full' }));
        ws.close();
        return;
    }

    const playerId = players.length + 1;
    players.push(ws);
    ws.send(JSON.stringify({ type: 'assign', playerId }));

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'move') {
            if (playerId === 1) gameState.player1 = data.move;
            if (playerId === 2) gameState.player2 = data.move;

            if (gameState.player1 && gameState.player2) {
                const result = determineWinner(gameState.player1, gameState.player2);
                if (result === 'player1') gameState.player1Score++;
                if (result === 'player2') gameState.player2Score++;

                players.forEach((player, index) => {
                    player.send(JSON.stringify({
                        type: 'result',
                        player1Move: gameState.player1,
                        player2Move: gameState.player2,
                        winner: result,
                        player1Score: gameState.player1Score,
                        player2Score: gameState.player2Score
                    }));
                });

                gameState.player1 = null;
                gameState.player2 = null;
            }
        }
    });

    ws.on('close', () => {
        players = players.filter(player => player !== ws);
        if (players.length === 0) {
            gameState = {
                player1: null,
                player2: null,
                player1Score: 0,
                player2Score: 0
            };
        }
    });
});

function determineWinner(move1, move2) {
    if (move1 === move2) return 'draw';
    if (
        (move1 === 'rock' && move2 === 'scissors') ||
        (move1 === 'scissors' && move2 === 'paper') ||
        (move1 === 'paper' && move2 === 'rock')
    ) return 'player1';
    return 'player2';
}
