let playerId = null;
const ws = new WebSocket('ws://localhost:3000');

ws.onmessage = (message) => {
    const data = JSON.parse(message.data);

    if (data.type === 'assign') {
        playerId = data.playerId;
        document.getElementById('player-info').innerText = `You are Player ${playerId}`;
    } else if (data.type === 'result') {
        document.getElementById('result').innerText = `Player 1 chose ${data.player1Move}, Player 2 chose ${data.player2Move}. ${data.winner === 'draw' ? 'It\'s a draw!' : `${data.winner === 'player1' ? 'Player 1' : 'Player 2'} wins!`}`;
        document.getElementById('player1-score').innerText = data.player1Score;
        document.getElementById('player2-score').innerText = data.player2Score;
    } else if (data.type === 'error') {
        alert(data.message);
    }
};

function makeMove(move) {
    if (playerId !== null) {
        ws.send(JSON.stringify({ type: 'move', move }));
    }
}
