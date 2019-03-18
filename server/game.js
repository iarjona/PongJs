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

function start(gameData) {
    var ext = gameData.externalData;
    var int = gameData.internalData;
    
    //Initial config.
    int.padSpeed = 15;
    ext.ballIncrementX = 10;
    ext.ballIncrementY = ext.ballIncrementX;
    ext.speedIncrement = 1.0;

    ext.windowWidth = 800;
    ext.windowHeight = 600;
    ext.padHeight = 100;
    ext.blockSize = 25;
    ext.ballSize = 15;
    ext.leftPadPosX = 0;
    ext.leftPadPosY = ext.windowHeight / 2 - ext.padHeight / 2;
    ext.rightPadPosX = ext.windowWidth - ext.blockSize;
    ext.rightPadPosY = ext.leftPadPosY;
    ext.ballPosX = ext.windowWidth / 2;
    ext.ballPosY = ext.windowHeight / 2;

    gameData.loop = setInterval(function () {
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
            //showAlertWithDelay("Goal for player one!", 1000);
            //fireGoalEvents();
            ext.leftPadPosX = 0;
            ext.leftPadPosY = ext.windowHeight / 2 - ext.padHeight / 2;
            ext.rightPadPosX = ext.windowWidth - ext.blockSize;
            ext.rightPadPosY = ext.leftPadPosY;
            ext.ballPosX = ext.windowWidth / 2;
            ext.ballPosY = ext.windowHeight / 2;
        } else if (isGoalOnLeft) {
            ext.playerTwoScore++;
            //showAlertWithDelay("Goal for player two!", 1000);
            //fireGoalEvents();
            ext.leftPadPosX = 0;
            ext.leftPadPosY = ext.windowHeight / 2 - ext.padHeight / 2;
            ext.rightPadPosX = ext.windowWidth - ext.blockSize;
            ext.rightPadPosY = ext.leftPadPosY;
            ext.ballPosX = ext.windowWidth / 2;
            ext.ballPosY = ext.windowHeight / 2;
            //fireNoGoalEvents();
        } else if (collisionOnLeft || collisionOnRight) {
            ext.ballIncrementX *= -1;
        }
    
        if (!isGoalOnLeft && !isGoalOnRight) {
            ext.ballPosX += ext.ballIncrementX * ext.speedIncrement;
            ext.ballPosY += ext.ballIncrementY * ext.speedIncrement;
    
            if (ext.ballPosY + ext.ballSize >= ext.windowHeight - ext.blockSize) ext.ballPosY = ext.windowHeight - ext.blockSize - ext.ballSize;
            else if (ext.ballPosY - ext.ballSize <= ext.blockSize) ext.ballPosY = ext.blockSize + ext.ballSize;
            if (ext.ballPosX + ext.ballSize >= ext.windowWidth - ext.blockSize) ext.ballPosX = ext.windowWidth - ext.blockSize - ext.ballSize;
            else if (ext.ballPosX - ext.ballSize <= ext.blockSize) ext.ballPosX = ext.blockSize + ext.ballSize;
        }

        for(var i = 0; i<gameData.players.length; i++){
            Utils.failSafeSend(gameData.players[i].connection, gameData.externalData);
        }
    }, 1000 / 60);
}

function fireNoGoalEvents() {
    noGoalHitsCount++;

    if (noGoalHitsCount == noGoalHitsToSpeedUp) {
        noGoalHitsCount = 0;
        speedIncrement += 0.5;
        showWarningWithDelay("Game speed increased! [" + speedIncrement * 100 + " %]", 1000);
    }

    ballIncrementX *= -1;
}

function fireGoalEvents(isAIEnabled) {
    noGoalHitsCount = 0;
    speedIncrement = 1.0;
    ballPosX = $("#gameContainer")[0].width / 2;

    ballIncrementX *= -1;

    startGameLoopAfterTimeout(function () {
        return calculateOffline(isAIEnabled);
    }, waitForNewRound);
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
        var internalData = {leftPlayer:null, rightPlayer:null};
        var externalData = {playerOneScore:0, playerTwoScore: 0};
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