var WebSocketServer = require('ws').Server;
var Utils = require('./utils');

var GameServer = {
    playerCount: 0,
    duelGames: []
}

GameServer.listen = function (webSocketPort) {
    const webSocketServer = new WebSocketServer({ port: webSocketPort });
    webSocketServer.on('connection', function connection(ws) {
        var playerId = assignGame(ws);
        Utils.failSafeSend(ws, {playerId: playerId});

        ws.on('message', function incoming(message) {
            queueEvent(ws, message);
        });
    });
}

GameServer.start = function (gameData) {
    setInterval(function () {
        var leftPadGoesUp;
        var leftPadGoesDown;
        var rightPadGoesUp;
        var rightPadGoesDown;

        var eventCount = gameData.eventQueue.length;
        for (var i = 0; i < eventCount; i++) {
            var event = gameData.eventQueue[i]
            if (!gameData.internalData.leftPlayer) gameData.internalData.leftPlayer = event.playerId;
            if (!gameData.internalData.rightPlayer) if (event.playerId != gameData.internalData.leftPlayer) gameData.internalData.rightPlayer = event.playerId;

            if (event.playerId == gameData.internalData.rightPlayer) {
                rightPadGoesUp = event.data.wPressed || event.data.upPressed;
                rightPadGoesDown = event.data.sPressed || event.data.downPressed;
            }
            if (event.playerId == gameData.internalData.leftPlayer) {
                leftPadGoesUp = event.data.wPressed || event.data.upPressed;;
                leftPadGoesDown = event.data.sPressed || event.data.downPressed;
            }
        }
        gameData.eventQueue.splice(0, eventCount);

        if (rightPadGoesUp) gameData.externalData.rightPadPosY -= 5;
        if (rightPadGoesDown) gameData.externalData.rightPadPosY += 5;
        if (leftPadGoesUp) gameData.externalData.leftPadPosY -= 5;
        if (leftPadGoesDown) gameData.externalData.leftPadPosY += 5;

        for(var i = 0; i<gameData.players.length; i++){
            Utils.failSafeSend(gameData.players[i].connection, gameData.externalData);
        }
    }, 1000 / 60);
}

function assignGame(ws) {
    GameServer.playerCount++;

    var assignedGame;

    var newPlayer = { id: GameServer.playerCount, connection: ws };
    for (var i = 0; i < GameServer.duelGames.length && !assignedGame; i++) {
        var game = GameServer.duelGames[i];
        if (!game.ready) {
            game.players.push(newPlayer);
            game.ready = true;
            GameServer.start(game);

            assignedGame = game;
        }
    }

    if (!assignedGame) {
        var internalData = {leftPlayer:null, rightPlayer:null};
        var externalData = {leftPadPosY: 25, rightPadPosY: 30, leftPadPosX: 0, rightPadPosX:50};
        var newGame = { players: [newPlayer], ready: false, eventQueue: [], internalData, externalData};
        GameServer.duelGames.push(newGame);
    }

    return GameServer.playerCount;
}

function queueEvent(ws, message) {
    try {
        var event = JSON.parse(message);
        if (!event.playerId) {
            Utils.failSafeSend(ws, {error: 'No playerId was provided.'});
        } else {
            var eventQueued = false;
            for(var i=0; i<GameServer.duelGames.length && !eventQueued; i++){
                var game = GameServer.duelGames[i];
                for(var j=0; j<game.players.length && !eventQueued; j++){
                    var player = game.players[j];

                    if (player.id == event.playerId && player.connection == ws) {
                        game.eventQueue.push(event);
                        eventQueued = true;
                    }
                }
            }
            if (!eventQueued) console.log(`The event was not queued. ${message}`);
        }
    } catch (ex) {
        console.log('Error parsing JSON. ', ex)
    }
}

module.exports = GameServer;