var express = require('express');
var ws = require('ws');

var httpPort = 27080;
var wsPort = httpPort + 1;

var httpsvc = express();
httpsvc.use(express.static(__dirname));
httpsvc.listen(httpPort);
httpsvc.get('*', function (req, res) {
    res.redirect('/pong');
});

console.log('Setting HTTP/WS server on $httpPort/$wsPort'
    .replace('$httpPort',httpPort).replace('$wsPort',wsPort));

var currentGames = [];

var wssvc = new ws.Server({ port: wsPort });
wssvc.on('connection', function connection(wsClient) {
    wsClient.on('message', function incoming(message) {
        //Log the new message
        console.log('New message: ' + message);

        //Handle JSON. We've assume we receive an stringify JSON.
        var jsonMessage = JSON.parse(message);
    });
});