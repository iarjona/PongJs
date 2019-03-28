function startOnline(gameType){
    configureOnline(gameType);

    gameLoop = {}; //Avoid resize event
}

function configureOnline(gameType){
    var ws = new WebSocket('ws://' + window.location.hostname);
    var playerId;
    ws.onmessage = function(event){
        try{
            var data = JSON.parse(event.data);
            if (!playerId){
                if (data.status) {
                    if (data.status == 'OK') {
                        playerId = data.playerId;
                        showInfoWithDelay('Connected... Finding other player...', 3000);
    
                        var loop = setInterval(function(){
                            var data = {goesUp: keyWPressed||keyUpPressed, goesDown: keySPressed||keyDownPressed};
                            var moveData = {playerId: playerId, data: data};
                            if (ws.readyState == ws.OPEN) {
                                if (moveData.data.goesUp || moveData.data.goesDown){
                                    ws.send(JSON.stringify(moveData));
                                }
                            } else {
                                console.log('WebSocket readyState: ', ws.readyState);
                                clearInterval(loop);
                            }
                        }, fixedRefreshTime);
                    } else {
                        ws.close();
                        showErrorWithDelay('Player was disconnected... Reloading game.', 3000);
                        setTimeout(function(){
                            location.reload();
                        }, 5000);
                    }
                }
            }else{
                drawGame(data);
            }
        }catch(ex){
            console.log('Error parsing JSON: '+event.data, ex);
        }
    };

    ws.onopen = function(){
        if (ws.readyState == ws.OPEN) {
            var data = {gameType: gameType};
            ws.send(JSON.stringify(data));
        }
    }
}