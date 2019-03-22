var Utils = require('./utils');

var Duel = {};

Duel.start = function(gameData){
    //Initial static config.
    gameData.context = {
        pendingNotifications: [],
        windowWidth: 800,
        padSpeed: 15,
        noGoalHitsCount: 0,
        noGoalHitsToSpeedUp: 5,
        windowHeight: 600,
        playerOneScore: 0,
        playerTwoScore: 0,
        ballIncrementX: 10,
        ballIncrementY: 10,
        speedIncrement: 1.0,
        padHeight: 100,
        blockSize: 25,
        ballSize: 15
    };

    //Initial dynamic config.
    gameData.context.leftPadPosX = 0;
    gameData.context.leftPadPosY = gameData.context.windowHeight / 2 - gameData.context.padHeight / 2;
    gameData.context.rightPadPosX = gameData.context.windowWidth - gameData.context.blockSize;
    gameData.context.rightPadPosY = gameData.context.leftPadPosY;
    gameData.context.ballPosX = gameData.context.windowWidth / 2;
    gameData.context.ballPosY = gameData.context.windowHeight / 2;

    //Init loop
    gameData.loop = setInterval(function () {
        calculate(gameData);
    }, 1000 / 60);
}

function calculate(gameData) {
    var leftPadGoesUp;
    var leftPadGoesDown;
    var rightPadGoesUp;
    var rightPadGoesDown;

    var eventCount = gameData.eventQueue.length;
    for (var i = 0; i < eventCount; i++) {
        var event = gameData.eventQueue[i]
        if (!gameData.context.leftPlayer) gameData.context.leftPlayer = event.playerId;
        if (!gameData.context.rightPlayer) if (event.playerId != gameData.context.leftPlayer) gameData.context.rightPlayer = event.playerId;

        if (event.playerId == gameData.context.rightPlayer) {
            rightPadGoesUp = event.data.wPressed || event.data.upPressed;
            rightPadGoesDown = event.data.sPressed || event.data.downPressed;
        }
        if (event.playerId == gameData.context.leftPlayer) {
            leftPadGoesUp = event.data.wPressed || event.data.upPressed;;
            leftPadGoesDown = event.data.sPressed || event.data.downPressed;
        }
    }
    gameData.eventQueue.splice(0, eventCount);
    gameData.context.pendingNotifications = [];

    if (rightPadGoesUp) gameData.context.rightPadPosY -= gameData.context.padSpeed;
    if (rightPadGoesDown) gameData.context.rightPadPosY += gameData.context.padSpeed;
    if (leftPadGoesUp) gameData.context.leftPadPosY -= gameData.context.padSpeed;
    if (leftPadGoesDown) gameData.context.leftPadPosY += gameData.context.padSpeed;

    if (gameData.context.rightPadPosY <= gameData.context.blockSize) gameData.context.rightPadPosY = gameData.context.blockSize;
    if (gameData.context.rightPadPosY + gameData.context.padHeight >= gameData.context.windowHeight - gameData.context.blockSize) gameData.context.rightPadPosY = gameData.context.windowHeight - gameData.context.blockSize - gameData.context.padHeight;
    if (gameData.context.leftPadPosY <= gameData.context.blockSize) gameData.context.leftPadPosY = gameData.context.blockSize;
    if (gameData.context.leftPadPosY + gameData.context.padHeight >= gameData.context.windowHeight - gameData.context.blockSize) gameData.context.leftPadPosY = gameData.context.windowHeight - gameData.context.blockSize - gameData.context.padHeight;

    if (gameData.context.ballPosY - gameData.context.ballSize <= gameData.context.blockSize || gameData.context.ballPosY + gameData.context.ballSize >= gameData.context.windowHeight - gameData.context.blockSize) gameData.context.ballIncrementY *= -1;

    var collisionOnRight = gameData.context.ballPosX + gameData.context.ballSize >= gameData.context.windowWidth - gameData.context.blockSize;
    var collisionOnLeft = gameData.context.ballPosX - gameData.context.ballSize <= gameData.context.blockSize;
    var isGoalOnRight = collisionOnRight && (gameData.context.rightPadPosY > gameData.context.ballPosY || gameData.context.rightPadPosY + gameData.context.padHeight < gameData.context.ballPosY);
    var isGoalOnLeft = collisionOnLeft && (gameData.context.leftPadPosY > gameData.context.ballPosY || gameData.context.leftPadPosY + gameData.context.padHeight < gameData.context.ballPosY);

    if (isGoalOnRight) {
        gameData.context.playerOneScore++;
        gameData.context.pendingNotifications.push({ text: 'Goal for left-side player!', type: 'alert', delay: 1000 });

        fireGoalEvents(gameData);
    } else if (isGoalOnLeft) {
        gameData.context.playerTwoScore++;
        gameData.context.pendingNotifications.push({ text: 'Goal for right-side player!', type: 'alert', delay: 1000 });

        fireGoalEvents(gameData);
    } else {
        if (collisionOnLeft || collisionOnRight) fireNoGoalEvents(gameData);
        gameData.context.ballPosX += gameData.context.ballIncrementX * gameData.context.speedIncrement;
        gameData.context.ballPosY += gameData.context.ballIncrementY * gameData.context.speedIncrement;

        if (gameData.context.ballPosY + gameData.context.ballSize >= gameData.context.windowHeight - gameData.context.blockSize) gameData.context.ballPosY = gameData.context.windowHeight - gameData.context.blockSize - gameData.context.ballSize;
        else if (gameData.context.ballPosY - gameData.context.ballSize <= gameData.context.blockSize) gameData.context.ballPosY = gameData.context.blockSize + gameData.context.ballSize;
        if (gameData.context.ballPosX + gameData.context.ballSize >= gameData.context.windowWidth - gameData.context.blockSize) gameData.context.ballPosX = gameData.context.windowWidth - gameData.context.blockSize - gameData.context.ballSize;
        else if (gameData.context.ballPosX - gameData.context.ballSize <= gameData.context.blockSize) gameData.context.ballPosX = gameData.context.blockSize + gameData.context.ballSize;
    }

    var successPlayerOne = Utils.failSafeSend(gameData.players[0].connection, gameData.context);
    if (successPlayerOne) {
        var successPlayerTwo = Utils.failSafeSend(gameData.players[1].connection, gameData.context);
        if (!successPlayerTwo) {
            Utils.failSafeSend(gameData.players[0].connection, {status: 'KO'})
            clearInterval(gameData.loop);
        }
    } else {
        Utils.failSafeSend(gameData.players[1].connection, {status: 'KO'});
        clearInterval(gameData.loop);
    }
}

function fireNoGoalEvents(gameData) {
    gameData.context.noGoalHitsCount++;

    if (gameData.context.noGoalHitsCount == gameData.context.noGoalHitsToSpeedUp) {
        gameData.context.noGoalHitsCount = 0;
        gameData.context.speedIncrement += 0.5;
        gameData.context.pendingNotifications.push({ text: 'Game speed increased! [' + gameData.context.speedIncrement * 100 + ' %]', type: 'warning', delay: 1000 });
    }

    gameData.context.ballIncrementX *= -1;
}

function fireGoalEvents(gameData) {
    gameData.context.noGoalHitsCount = 0;
    gameData.context.speedIncrement = 1.0;
    gameData.context.ballIncrementX *= -1;

    gameData.context.leftPadPosX = 0;
    gameData.context.leftPadPosY = gameData.context.windowHeight / 2 - gameData.context.padHeight / 2;
    gameData.context.rightPadPosX = gameData.context.windowWidth - gameData.context.blockSize;
    gameData.context.rightPadPosY = gameData.context.leftPadPosY;
    gameData.context.ballPosX = gameData.context.windowWidth / 2;
    gameData.context.ballPosY = gameData.context.windowHeight / 2;

    clearInterval(gameData.loop);
    setTimeout(function () {
        gameData.loop = setInterval(function () {
            calculate(gameData);
        }, 1000 / 60);
    }, 3000);
}

module.exports = Duel;