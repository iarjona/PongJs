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
    }).drawImage({ //Logo
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