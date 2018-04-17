var gameStarted = false;
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
        initGameContainer();

        if (!gameStarted) {
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
            gameStarted = true;

            handleGame();
            eval(menuOptions[selectedOptionIndex].mode);
        }
    });
}

function handleGame() {
    resetHandlers();

    $("body").keydown(function (event) {
        if (event.keyCode == keyEscape) {
            gameStarted = false;
            stopGameLoop();

            cleanGameContainer();
            drawMenu();
            handleMenu();
        }

        if (event.keyCode == keyUp) keyUpPressed = true;
        else if (event.keyCode == keyDown) keyDownPressed = true;
        else if (event.keyCode == keyW) keyWPressed = true;
        else if (event.keyCode == keyS) keySPressed = true;
    });

    $("body").keydown(function (event) {
        if (event.keyCode == keyUp) keyUpPressed = false;
        else if (event.keyCode == keyDown) keyDownPressed = false;
        else if (event.keyCode == keyW) keyWPressed = false;
        else if (event.keyCode == keyS) keySPressed = false;
    });
}

function startOffline() {
    startGameLoop();
}

function startGameLoop() {
    gameLoop = setInterval(function () {
        drawGame();
    }, fixedRefreshTime);
}

function stopGameLoop() {
    clearInterval(gameLoop);
    gameLoop = null;
}