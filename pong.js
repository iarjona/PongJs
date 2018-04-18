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
var ballPosX;
var ballPosY;
var ballSize = 15;
var blockSize = 25;

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
        source: '/pong.png',
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

function drawGame() {
    cleanGameContainer();

    drawLayout();
    drawPads();
    drawBall();
}

function drawLayout() {
    $('#gameContainer').drawRect({
        fillStyle: 'blue',
        x: 0,
        y: 0,
        fromCenter: false,
        width: $("#gameContainer")[0].width,
        height: blockSize
    });

    $('#gameContainer').drawRect({
        fillStyle: 'blue',
        x: 0,
        y: $("#gameContainer")[0].height - blockSize,
        fromCenter: false,
        width: $("#gameContainer")[0].width,
        height: blockSize
    });
}

function drawPads() {
    $('#gameContainer').drawRect({
        fillStyle: 'cyan',
        x: leftPadPosX,
        y: leftPadPosY,
        fromCenter: false,
        width: blockSize,
        height: padHeight
    });

    $('#gameContainer').drawRect({
        fillStyle: 'cyan',
        x: rightPadPosX,
        y: rightPadPosY,
        fromCenter: false,
        width: blockSize,
        height: padHeight
    });
}

function drawBall() {
    $('#gameContainer').drawArc({
        fillStyle: 'white',
        x: ballPosX, y: ballPosY,
        radius: ballSize
    });
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
            handleGame();
            eval(menuOptions[selectedOptionIndex].mode);
        }
    });
}

function handleGame() {
    resetHandlers();

    $("body").keydown(function (event) {
        if (event.keyCode == keyEscape) {
            if (confirm("Are you sure you want leave game?")) {
                stopGameLoop();

                cleanGameContainer();
                drawMenu();
                handleMenu();
            }
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

function startOffline() {
    configureOffline();
    startGameLoop(calculateOffline);
}

function configureOffline() {
    leftPadPosX = 0;
    leftPadPosY = $("#gameContainer")[0].height / 2 - padHeight / 2;
    rightPadPosX = $("#gameContainer")[0].width - blockSize;
    rightPadPosY = leftPadPosY;
    ballPosX = $("#gameContainer")[0].width / 2;
    ballPosY = $("#gameContainer")[0].height / 2;
}

function calculateOffline() {
    if (keyUpPressed && rightPadPosY > blockSize) rightPadPosY -= padSpeed;
    if (keyDownPressed && rightPadPosY + padHeight < $("#gameContainer")[0].height - blockSize) rightPadPosY += padSpeed;
    if (keyWPressed && leftPadPosY > blockSize) leftPadPosY -= padSpeed;
    if (keySPressed && leftPadPosY + padHeight < $("#gameContainer")[0].height - blockSize) leftPadPosY += padSpeed;

    if (ballPosX - ballSize <= blockSize || ballPosX + ballSize >= $("#gameContainer")[0].width - blockSize) ballIncrementX *= -1
    if (ballPosY - ballSize <= blockSize || ballPosY + ballSize >= $("#gameContainer")[0].height - blockSize) ballIncrementY *= -1;
    ballPosX += ballIncrementX;
    ballPosY += ballIncrementY;
}

function startGameLoop(calculateGame) {
    gameLoop = setInterval(function () {
        calculateGame();
        drawGame();
    }, fixedRefreshTime);
}

function stopGameLoop() {
    clearInterval(gameLoop);
    gameLoop = null;
}