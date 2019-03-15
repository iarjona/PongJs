function startOnline(){
    configureOnline();
}

function configureOnline(){
    var ws = new WebSocket('ws://localhost');
    var playerId;
    ws.onmessage = function(event){
        try{
            var data = JSON.parse(event.data);
            if (!playerId){
                if (data.playerId) {
                    playerId = data.playerId;
                    showInfoWithDelay('Connected... Finding other player...', 3000);

                    var loop = setInterval(function(){
                        var data = {wPressed: keyWPressed||keyUpPressed, sPressed: keySPressed||keyDownPressed};
                        var moveData = {playerId: playerId, data: data};
                        if (ws.readyState == ws.OPEN) {
                            if (moveData.data.wPressed || moveData.data.sPressed) {
                                ws.send(JSON.stringify(moveData));
                            }
                        } else {
                            console.log('WebSocket readyState: ', ws.readyState);
                            clearInterval(loop);
                        }
                    }, 1000/60);
                }
                /*if (data.event && data.event.name == 'ready') {
                    lobbyId = data.event.value;
                    console.log(lobbyId);
                    showInfoWithDelay('Prepare yourself! '+ userName, 1000);
                    var loop = setInterval(function(){
                        var data = {wPressed: keyWPressed, sPressed: keySPressed};
                        var moveData = {sessionId: playerId, lobbyId: lobbyId, data: data};
                        if (ws.readyState == ws.OPEN) {
                            if (moveData.data.wPressed || moveData.data.sPressed) {
                                ws.send(JSON.stringify(moveData));
                            } else {
                                console.log('Not sending');
                            }
                        } else {
                            console.log('WebSocket readyState: ', ws.readyState);
                            clearInterval(loop);
                        }
                    }, 1000/60);
                }*/
            }else{
                drawGame(data);
            }
        }catch(ex){
            console.log('Error parsing JSON: '+event.data, ex);
        }
    };
}