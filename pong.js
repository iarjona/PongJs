var gameStarted = false;

var keyUp = 38;
var keyDown = 40;
var keyEnter = 13;

var textFontSize = 32;
var textFontStroke = 0.75;

var menuOptions = [
    {
        "title": "Start local multiplayer!",
        "mode": "startLocal()"
    },
    {
        "title": "Start online multiplayer!",
        "mode": "startOnline()"
    },
    {
        "title": "Start online battle royale!",
        "mode": "startBattleRoyale()"
    },
];
var selectedOptionIndex = 0;
var selectedOptionStyle = ["#60EA41", "#000"];
var unSelectedOptionStyle = ["#3399FF", "#000"];

$(document).ready(function () {
    console.log("Game ready!");

    $(window).resize(function () {
        draw();
    });

    $("body").keydown(function (event) {
        console.log("Key pressed: " + event.keyCode);

        if (!gameStarted) {
            if (event.keyCode == keyUp && selectedOptionIndex > 0) {
                selectedOptionIndex--;
            } else if (event.keyCode == keyDown && selectedOptionIndex < menuOptions.length - 1) {
                selectedOptionIndex++;
            } else if (event.keyCode == keyEnter) {
                console.log("Calling: " + menuOptions[selectedOptionIndex].mode);
                eval(menuOptions[selectedOptionIndex].mode);
            }
        }

        draw();
    });

    draw();
});

function draw() {
    initGameContainer();

    if (!gameStarted) {
        drawMenu();
    }
}

function initGameContainer() {
    var w = $(window).width() - 25;
    var h = $(window).height() - 25;

    if (w < 800) w = 800;
    if (h < 600) h = 600;

    $("body").empty();
    $("body").append("<canvas id='gameContainer' width='" + w + "' height='" + h + "'></canvas>");
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