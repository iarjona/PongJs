var fixedRefreshTime = 1000 / 60;
var gameLoop;

var keyUpPressed, keyDownPressed, keyWPressed, keySPressed;

var enterKeyCode = 13;
var escapeKeyCode = 27;
var upKeyCode = 38;
var downKeyCode = 40;
var wKeyCode = 87;
var sKeyCode = 83;

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
var pendingNotifications = [];

var textFontSize = 32;
var textFontStroke = 0.75;

var randomColor;
var playerOneScore = 0;
var playerTwoScore = 0;
var waitForNewRound = 1000;
var noGoalHitsCount = 0;
var noGoalHitsToSpeedUp = 5;

var selectedOptionIndex = 0;
var selectedOptionStyle = ["#60EA41", "#000"];
var unSelectedOptionStyle = ["#3399FF", "#000"];

var menuOptions = [
    {
        "title": "Play!",
        "mode": "startOfflineWithAI(true)"
    },
    {
        "title": "Play with friends!",
        "mode": "startOfflineWithAI(false)"
    },
    {
        "title": "Play online!",
        "mode": "startOnline('duel')"
    },
    {
        "title": "Battle Royale!",
        "mode": "startOnline('battleRoyale')"
    }
];

$(document).ready(function () {
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

function initGameContainer(fixedHeight, fixedWidth) {
    var w = fixedWidth ? fixedWidth : $(window).width() - 25;
    var h = fixedHeight ? fixedHeight : $(window).height() - 25;

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

        if ((event.keyCode == upKeyCode || event.keyCode == wKeyCode) && selectedOptionIndex > 0) {
            selectedOptionIndex--;
            drawMenu();
        } else if ((event.keyCode == downKeyCode || event.keyCode == sKeyCode) && selectedOptionIndex < menuOptions.length - 1) {
            selectedOptionIndex++;
            drawMenu();
        } else if (event.keyCode == enterKeyCode) {
            randomColor = generateRandomColor();

            handleGame();
            eval(menuOptions[selectedOptionIndex].mode);
        }
    });
}

function handleGame() {
    resetHandlers();

    $("body").keydown(function (event) {
        if (event.keyCode == escapeKeyCode) {
            var conf = getConfirmationWithDelay("Do you want to leave the game?", 3000,
                function () {
                    location.reload();
                }
            );

            conf.show();
        }

        if (event.keyCode == upKeyCode) keyUpPressed = true;
        else if (event.keyCode == downKeyCode) keyDownPressed = true;
        else if (event.keyCode == wKeyCode) keyWPressed = true;
        else if (event.keyCode == sKeyCode) keySPressed = true;
    });

    $("body").keyup(function (event) {
        if (event.keyCode == upKeyCode) keyUpPressed = false;
        else if (event.keyCode == downKeyCode) keyDownPressed = false;
        else if (event.keyCode == wKeyCode) keyWPressed = false;
        else if (event.keyCode == sKeyCode) keySPressed = false;
    });
}

function startGameLoopAfterTimeout(calculateGame, timeout) {
    stopGameLoop();

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