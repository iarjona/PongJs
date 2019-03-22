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
        Utils.failSafeSend(ws, { status: 'OK', playerId: playerId });

        ws.on('message', function incoming(message) {
            queueEvent(ws, message);
        });
    });
}

function start(gameData) {
    //Initial config.
    gameData.internalData.padSpeed = 15;
    gameData.internalData.noGoalHitsCount = 0;
    gameData.internalData.noGoalHitsToSpeedUp = 5;
    gameData.externalData.ballIncrementX = 10;
    gameData.externalData.ballIncrementY = gameData.externalData.ballIncrementX;
    gameData.externalData.speedIncrement = 1.0;
    gameData.externalData.pendingNotifications = [];

    gameData.externalData.windowWidth = 800;
    gameData.externalData.windowHeight = 600;
    gameData.externalData.padHeight = 100;
    gameData.externalData.blockSize = 25;
    gameData.externalData.ballSize = 15;
    gameData.externalData.leftPadPosX = 0;
    gameData.externalData.leftPadPosY = gameData.externalData.windowHeight / 2 - gameData.externalData.padHeight / 2;
    gameData.externalData.rightPadPosX = gameData.externalData.windowWidth - gameData.externalData.blockSize;
    gameData.externalData.rightPadPosY = gameData.externalData.leftPadPosY;
    gameData.externalData.ballPosX = gameData.externalData.windowWidth / 2;
    gameData.externalData.ballPosY = gameData.externalData.windowHeight / 2;

    gameData.loop = setInterval(function () {
        calculate(gameData);
    }, 1000 / 60);
}

function calculate(gameData) {
    var int = gameData.internalData;
    var ext = gameData.externalData;

    var leftPadGoesUp;
    var leftPadGoesDown;
    var rightPadGoesUp;
    var rightPadGoesDown;

    var eventCount = gameData.eventQueue.length;
    for (var i = 0; i < eventCount; i++) {
        var event = gameData.eventQueue[i]
        if (!int.leftPlayer) int.leftPlayer = event.playerId;
        if (!int.rightPlayer) if (event.playerId != int.leftPlayer) int.rightPlayer = event.playerId;

        if (event.playerId == int.rightPlayer) {
            rightPadGoesUp = event.data.wPressed || event.data.upPressed;
            rightPadGoesDown = event.data.sPressed || event.data.downPressed;
        }
        if (event.playerId == int.leftPlayer) {
            leftPadGoesUp = event.data.wPressed || event.data.upPressed;;
            leftPadGoesDown = event.data.sPressed || event.data.downPressed;
        }
    }
    gameData.eventQueue.splice(0, eventCount);
    ext.pendingNotifications = [];

    if (rightPadGoesUp) ext.rightPadPosY -= int.padSpeed;
    if (rightPadGoesDown) ext.rightPadPosY += int.padSpeed;
    if (leftPadGoesUp) ext.leftPadPosY -= int.padSpeed;
    if (leftPadGoesDown) ext.leftPadPosY += int.padSpeed;

    if (ext.rightPadPosY <= ext.blockSize) ext.rightPadPosY = ext.blockSize;
    if (ext.rightPadPosY + ext.padHeight >= ext.windowHeight - ext.blockSize) ext.rightPadPosY = ext.windowHeight - ext.blockSize - ext.padHeight;
    if (ext.leftPadPosY <= ext.blockSize) ext.leftPadPosY = ext.blockSize;
    if (ext.leftPadPosY + ext.padHeight >= ext.windowHeight - ext.blockSize) ext.leftPadPosY = ext.windowHeight - ext.blockSize - ext.padHeight;

    if (ext.ballPosY - ext.ballSize <= ext.blockSize || ext.ballPosY + ext.ballSize >= ext.windowHeight - ext.blockSize) ext.ballIncrementY *= -1;

    var collisionOnRight = ext.ballPosX + ext.ballSize >= ext.windowWidth - ext.blockSize;
    var collisionOnLeft = ext.ballPosX - ext.ballSize <= ext.blockSize;
    var isGoalOnRight = collisionOnRight && (ext.rightPadPosY > ext.ballPosY || ext.rightPadPosY + ext.padHeight < ext.ballPosY);
    var isGoalOnLeft = collisionOnLeft && (ext.leftPadPosY > ext.ballPosY || ext.leftPadPosY + ext.padHeight < ext.ballPosY);

    if (isGoalOnRight) {
        ext.playerOneScore++;
        ext.pendingNotifications.push({ text: 'Goal for left-side player!', type: 'alert', delay: 1000 });

        fireGoalEvents(gameData);
    } else if (isGoalOnLeft) {
        ext.playerTwoScore++;
        ext.pendingNotifications.push({ text: 'Goal for right-side player!', type: 'alert', delay: 1000 });

        fireGoalEvents(gameData);
    } else {
        if (collisionOnLeft || collisionOnRight) fireNoGoalEvents(gameData);
        ext.ballPosX += ext.ballIncrementX * ext.speedIncrement;
        ext.ballPosY += ext.ballIncrementY * ext.speedIncrement;

        if (ext.ballPosY + ext.ballSize >= ext.windowHeight - ext.blockSize) ext.ballPosY = ext.windowHeight - ext.blockSize - ext.ballSize;
        else if (ext.ballPosY - ext.ballSize <= ext.blockSize) ext.ballPosY = ext.blockSize + ext.ballSize;
        if (ext.ballPosX + ext.ballSize >= ext.windowWidth - ext.blockSize) ext.ballPosX = ext.windowWidth - ext.blockSize - ext.ballSize;
        else if (ext.ballPosX - ext.ballSize <= ext.blockSize) ext.ballPosX = ext.blockSize + ext.ballSize;
    }

    var successPlayerOne = Utils.failSafeSend(gameData.players[0].connection, gameData.externalData);
    if (successPlayerOne) {
        var successPlayerTwo = Utils.failSafeSend(gameData.players[1].connection, gameData.externalData);
        if (!successPlayerTwo) {
            Utils.failSafeSend(gameData.players[0].connection, {status: 'KO'})
        }
    } else {
        Utils.failSafeSend(gameData.players[1].connection, {status: 'KO'});
    }
}

function fireNoGoalEvents(gameData) {
    gameData.internalData.noGoalHitsCount++;

    if (gameData.internalData.noGoalHitsCount == gameData.internalData.noGoalHitsToSpeedUp) {
        gameData.internalData.noGoalHitsCount = 0;
        gameData.internalData.speedIncrement += 0.5;
        gameData.externalData.pendingNotifications.push({ text: 'Game speed increased! [' + gameData.internalData.speedIncrement * 100 + ' %]', type: 'warning', delay: 1000 });
    }

    gameData.externalData.ballIncrementX *= -1;
}

function fireGoalEvents(gameData) {
    gameData.internalData.noGoalHitsCount = 0;
    gameData.internalData.speedIncrement = 1.0;
    gameData.externalData.ballIncrementX *= -1;

    gameData.externalData.leftPadPosX = 0;
    gameData.externalData.leftPadPosY = gameData.externalData.windowHeight / 2 - gameData.externalData.padHeight / 2;
    gameData.externalData.rightPadPosX = gameData.externalData.windowWidth - gameData.externalData.blockSize;
    gameData.externalData.rightPadPosY = gameData.externalData.leftPadPosY;
    gameData.externalData.ballPosX = gameData.externalData.windowWidth / 2;
    gameData.externalData.ballPosY = gameData.externalData.windowHeight / 2;

    clearInterval(gameData.loop);
    setTimeout(function () {
        gameData.loop = setInterval(function () {
            calculate(gameData);
        }, 1000 / 60);
    }, 3000);
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
            start(game);

            assignedGame = game;
        }
    }

    if (!assignedGame) {
        var internalData = { leftPlayer: null, rightPlayer: null };
        var externalData = { playerOneScore: 0, playerTwoScore: 0 };
        var newGame = { players: [newPlayer], ready: false, eventQueue: [], internalData, externalData };
        GameServer.duelGames.push(newGame);
    }

    return GameServer.playerCount;
}

function queueEvent(ws, message) {
    try {
        var event = JSON.parse(message);
        if (!event.playerId) {
            Utils.failSafeSend(ws, { error: 'No playerId was provided.' });
        } else {
            var eventQueued = false;
            for (var i = 0; i < GameServer.duelGames.length && !eventQueued; i++) {
                var game = GameServer.duelGames[i];
                for (var j = 0; j < game.players.length && !eventQueued; j++) {
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