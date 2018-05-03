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
    }).drawRect({
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
    }).drawRect({
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
    }).drawLine({
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
    }).drawRect({
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