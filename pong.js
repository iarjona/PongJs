var fixedRefreshTime = 1000 / 60;
var gameLoop;

var keyEnter = 13;
var keyEscape = 27;
var keyUp = 38;
var keyDown = 40;
var keyW = 87;
var keyS = 83;

var keyUpPressed;
var keyDownPressed;
var keyWPressed;
var keySPressed;

var textFontSize = 32;
var textFontStroke = 0.75;

var padHeight = 100;
var padSpeed = 15;
var leftPadPosX;
var leftPadPosY;
var rightPadPosX;
var rightPadPosY;
var ballIncrementX = 10;
var ballIncrementY = ballIncrementX;
var speedIncrement = 1.0;
var ballPosX;
var ballPosY;
var ballSize = 15;
var blockSize = 25;

var randomColor;
var playerOneScore = 0;
var playerTwoScore = 0;
var waitForNewRound = 1000;
var noGoalHitCount;
var hitCountsToSpeedUp = 5;

var menuOptions = [
    /*{
        "title": "Start game!",
        "mode": "startAI()"
    },*/
    {
        "title": "Play!",
        "mode": "startOffline()"
    },
    {
        "title": "Play online!",
        "mode": "startOnline()"
    },
    {
        "title": "Battle Royale!",
        "mode": "startBattleRoyale()"
    }
];

var selectedOptionIndex = 0;
var selectedOptionStyle = ["#60EA41", "#000"];
var unSelectedOptionStyle = ["#3399FF", "#000"];

$(document).ready(function () {
    console.log("Game ready!");

    $(window).resize(function () {
        if (!gameLoop) {
            initGameContainer();
            drawMenu();
            handleMenu();
        }
    });

    initGameContainer();
    drawMenu();
    handleMenu();
});

function initGameContainer() {
    var w = $(window).width() - 25;
    var h = $(window).height() - 25;

    if (w < 800) w = 800;
    if (h < 600) h = 600;

    $("body").empty();
    $("body").append("<canvas id='gameContainer' width='" + w + "' height='" + h + "'></canvas>");
}

function cleanGameContainer() {
    $("#gameContainer").clearCanvas();
}

function resetHandlers() {
    $("body").off("keydown")
    $("body").off("keyup");
}

function handleMenu() {
    resetHandlers();

    $("body").keydown(function (event) {
        console.log("Key pressed: " + event.keyCode);

        if ((event.keyCode == keyUp || event.keyCode == keyW) && selectedOptionIndex > 0) {
            selectedOptionIndex--;
            drawMenu();
        } else if ((event.keyCode == keyDown || event.keyCode == keyS) && selectedOptionIndex < menuOptions.length - 1) {
            selectedOptionIndex++;
            drawMenu();
        } else if (event.keyCode == keyEnter) {
            randomColor = generateRandomColor();
            handleGame();
            eval(menuOptions[selectedOptionIndex].mode);
        }
    });
}

function drawMenu() {
    //Background
    $('#gameContainer').drawRect({
        fillStyle: function (layer) {
            return $(this).createGradient({
                x1: 0, y1: layer.y - layer.height / 1.5,
                x2: 0, y2: layer.y + layer.height * 1.5,
                c1: '#000', c2: '#058cb4'
            });
        },
        x: 0, y: 0,
        width: $("#gameContainer")[0].width,
        height: $("#gameContainer")[0].height,
        fromCenter: false
    });

    //Logo
    $('#gameContainer').drawImage({
        source: 'img/pong.png',
        x: $("#gameContainer")[0].width - 100 - 15,
        y: $("#gameContainer")[0].height - 100 - 15,
        fromCenter: false
    });

    //Menu options
    for (var i = 0; i < menuOptions.length; i++) {
        var optionFillStyle = selectedOptionIndex == i ?
            selectedOptionStyle[0] : unSelectedOptionStyle[0];
        var optionStrokeStyle = selectedOptionIndex == i ?
            selectedOptionStyle[1] : unSelectedOptionStyle[1];

        if (selectedOptionIndex == i) {
            $('#gameContainer').drawRect({
                fillStyle: function (layer) {
                    return $(this).createGradient({
                        x1: 0, y1: layer.y - layer.height * 1.5,
                        x2: 0, y2: layer.y + layer.height / 1.5,
                        c1: '#058cb4', c2: '#000'
                    });
                },
                x: $("#gameContainer")[0].width / 2,
                y: $("#gameContainer")[0].height / (menuOptions.length + 1) * (i + 1),
                fromCenter: true,
                width: $("#gameContainer")[0].width * 0.75,
                height: textFontSize * 2,
                cornerRadius: 8
            });
        }

        $('#gameContainer').drawText({
            fillStyle: optionFillStyle,
            strokeStyle: optionStrokeStyle,
            strokeWidth: textFontStroke,
            x: $("#gameContainer")[0].width / 2,
            y: $("#gameContainer")[0].height / (menuOptions.length + 1) * (i + 1),
            fromCenter: true,
            fontSize: textFontSize,
            fontFamily: 'Orbitron',
            text: menuOptions[i].title
        });
    }
}

function handleGame() {
    resetHandlers();

    $("body").keydown(function (event) {
        if (event.keyCode == keyEscape) {
            var conf = getConfirmationWithDelay("Do you want to leave the game?", 3000,
                function () {
                    location.reload();
                }, function () {
                    conf.close();
                });

            conf.show();
        }

        if (event.keyCode == keyUp) keyUpPressed = true;
        else if (event.keyCode == keyDown) keyDownPressed = true;
        else if (event.keyCode == keyW) keyWPressed = true;
        else if (event.keyCode == keyS) keySPressed = true;
    });

    $("body").keyup(function (event) {
        if (event.keyCode == keyUp) keyUpPressed = false;
        else if (event.keyCode == keyDown) keyDownPressed = false;
        else if (event.keyCode == keyW) keyWPressed = false;
        else if (event.keyCode == keyS) keySPressed = false;
    });
}

function drawGame() {
    cleanGameContainer();

    drawLayout();
    drawScore();
    drawPads();
    drawBall();
}

function drawLayout() {
    //Background
    $('#gameContainer').drawRect({
        fillStyle: function (layer) {
            return $(this).createGradient({
                x1: 0, y1: 0,
                x2: 0, y2: $('#gameContainer')[0].height,
                c1: 'black',
                c2: randomColor,
                c3: 'black'
            });
        },
        x: 0, y: 0,
        width: $("#gameContainer")[0].width,
        height: $("#gameContainer")[0].height,
        fromCenter: false
    });

    $('#gameContainer').drawRect({
        fillStyle: function (layer) {
            return $(this).createGradient({
                x1: 0, y1: layer.y - layer.height / 1.5,
                x2: 0, y2: layer.y + layer.height * 1.5,
                c1: '#000', c2: randomColor
            });
        },
        x: 0,
        y: 0,
        fromCenter: false,
        width: $("#gameContainer")[0].width,
        height: blockSize
    });

    $('#gameContainer').drawRect({
        fillStyle: function (layer) {
            return $(this).createGradient({
                x1: 0, y1: layer.y - layer.height / 1.5,
                x2: 0, y2: layer.y + layer.height * 1.5,
                c1: '#000', c2: randomColor
            });
        },
        x: 0,
        y: $("#gameContainer")[0].height - blockSize,
        fromCenter: false,
        width: $("#gameContainer")[0].width,
        height: blockSize
    });

    $('#gameContainer').drawLine({
        strokeStyle: 'white',
        strokeWidth: 3,
        strokeDash: [5],
        strokeDashOffset: 0,
        x1: $('#gameContainer')[0].width / 2, y1: blockSize,
        x2: $('#gameContainer')[0].width / 2, y2: $('#gameContainer')[0].height - blockSize
    });
}

function drawScore() {
    $('#gameContainer')
        .drawText({
            fillStyle: 'white',
            x: $('#gameContainer')[0].width * 0.25,
            y: $('#gameContainer')[0].height / 6,
            fromCenter: true,
            fontSize: 50,
            fontFamily: 'Orbitron',
            text: playerOneScore
        })
        .drawText({
            fillStyle: 'white',
            x: $('#gameContainer')[0].width * 0.75,
            y: $('#gameContainer')[0].height / 6,
            fromCenter: true,
            fontSize: 50,
            fontFamily: 'Orbitron',
            text: playerTwoScore
        })
}

function drawPads() {
    $('#gameContainer').drawRect({
        fillStyle: 'white',
        x: leftPadPosX,
        y: leftPadPosY,
        fromCenter: false,
        width: blockSize,
        height: padHeight,
        cornerRadius: 8
    });

    $('#gameContainer').drawRect({
        fillStyle: 'white',
        x: rightPadPosX,
        y: rightPadPosY,
        fromCenter: false,
        width: blockSize,
        height: padHeight,
        cornerRadius: 8
    });
}

function drawBall() {
    $('#gameContainer').drawArc({
        fillStyle: 'white',
        x: ballPosX, y: ballPosY,
        radius: ballSize
    });
}

function startGameLoopAfterTimeout(calculateGame, timeout) {
    setTimeout(function () {
        gameLoop = setInterval(function () {
            calculateGame();
            drawGame();
        }, fixedRefreshTime);
    }, timeout);
}

function stopGameLoop() {
    clearInterval(gameLoop);
    gameLoop = null;
}

function startOffline() {
    configureOffline();

    drawGame();
    startGameLoopAfterTimeout(calculateOffline, waitForNewRound);
}

function configureOffline() {
    leftPadPosX = 0;
    leftPadPosY = $("#gameContainer")[0].height / 2 - padHeight / 2;
    rightPadPosX = $("#gameContainer")[0].width - blockSize;
    rightPadPosY = leftPadPosY;
    ballPosX = $("#gameContainer")[0].width / 2;
    ballPosY = $("#gameContainer")[0].height / 2;

    noGoalHitCount = 0;
}

function calculateOffline() {
    if (keyWPressed) leftPadPosY -= padSpeed;
    if (keySPressed) leftPadPosY += padSpeed;
    if (keyUpPressed) rightPadPosY -= padSpeed;
    if (keyDownPressed) rightPadPosY += padSpeed;

    if (rightPadPosY <= blockSize) rightPadPosY = blockSize;
    if (rightPadPosY + padHeight >= $("#gameContainer")[0].height - blockSize) rightPadPosY = $("#gameContainer")[0].height - blockSize - padHeight;
    if (leftPadPosY <= blockSize) leftPadPosY = blockSize;
    if (leftPadPosY + padHeight >= $("#gameContainer")[0].height - blockSize) leftPadPosY = $("#gameContainer")[0].height - blockSize - padHeight;

    if (ballPosY - ballSize <= blockSize || ballPosY + ballSize >= $("#gameContainer")[0].height - blockSize) ballIncrementY *= -1;

    var goalDetected = false;
    if (ballPosX + ballSize >= $("#gameContainer")[0].width - blockSize) {
        if (rightPadPosY > ballPosY || rightPadPosY + padHeight < ballPosY) {
            goalDetected = true;
            playerOneScore++;

            showAlertWithDelay("Goal for player one!", 1000);
        } else {
            noGoalHitCount++;
        }

        ballIncrementX *= -1;
    }
    if (ballPosX - ballSize <= blockSize) {
        if (leftPadPosY > ballPosY || leftPadPosY + padHeight < ballPosY) {
            goalDetected = true;
            playerTwoScore++;

            showAlertWithDelay("Goal for player two!", 1000);
        } else {
            noGoalHitCount++;
        }

        ballIncrementX *= -1;
    }

    if (noGoalHitCount == hitCountsToSpeedUp) {
        noGoalHitCount = 0;
        speedIncrement += 0.5;
        showWarningWithDelay("Game speed increased! [" + speedIncrement * 100 + " %]", 1000);
    }

    if (goalDetected) {
        stopGameLoop();
        configureOffline();

        startGameLoopAfterTimeout(calculateOffline, waitForNewRound);
    } else {
        ballPosX += ballIncrementX * speedIncrement;
        ballPosY += ballIncrementY * speedIncrement;

        if (ballPosY + ballSize >= $("#gameContainer")[0].height - blockSize) ballPosY = $("#gameContainer")[0].height - blockSize - ballSize;
        else if (ballPosY - ballSize <= blockSize) ballPosY = blockSize + ballSize;
        if (ballPosX + ballSize >= $("#gameContainer")[0].width - blockSize) ballPosX = $("#gameContainer")[0].width - blockSize - ballSize;
        else if (ballPosX - ballSize <= blockSize) ballPosX = blockSize + ballSize;
    }
}