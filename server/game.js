var WebSocketServer = require('ws').Server;
var Utils = require('./utils');
var Duel = require('./duel');

var Game = {
    playerCount: 0,
    duelGames: [],
    battleRoyaleGames: []
}

Game.listen = function (webSocketPort) {
    const webSocketServer = new WebSocketServer({ port: webSocketPort });
    webSocketServer.on('connection', function connection(ws) {
        var playerId = assignGame(ws);
        Utils.failSafeSend(ws, { status: 'OK', playerId: playerId });

        ws.on('message', function incoming(message) {
            queueEvent(ws, message);
        });
    });
}

function assignGame(ws) {
    Game.playerCount++;

    var assignedGame;

    var newPlayer = { id: Game.playerCount, connection: ws };
    for (var i = 0; i < Game.duelGames.length && !assignedGame; i++) {
        var game = Game.duelGames[i];
        if (!game.ready) {
            game.players.push(newPlayer);
            game.ready = true;
            Duel.start(game);

            assignedGame = game;
        }
    }

    if (!assignedGame) {
        var newGame = { players: [newPlayer], ready: false, eventQueue: []};
        Game.duelGames.push(newGame);
    }

    return Game.playerCount;
}

function queueEvent(ws, message) {
    try {
        var event = JSON.parse(message);
        if (!event.playerId) {
            Utils.failSafeSend(ws, { error: 'No playerId was provided.' });
        } else {
            var eventQueued = false;
            for (var i = 0; i < Game.duelGames.length && !eventQueued; i++) {
                var game = Game.duelGames[i];
                for (var j = 0; j < game.players.length && !eventQueued; j++) {
                    var player = game.players[j];

                    if (player.id == event.playerId && player.connection == ws) {
                        game.eventQueue.push(event);
                        eventQueued = true;
                    }
                }
            }
            if (!eventQueued) console.log(`The event was not queued. ${message}`);
        }
    } catch (ex) {
        console.log('Error parsing JSON. ', ex)
    }
}

module.exports = Game;