var express = require('express');
var GameServer = require('./server/game');

var args = process.argv.slice(2);

var httpPort = 27080;
var wsPort = 80;
//TODO Command line, arguments
console.log(`Setting HTTP/WS server on ${httpPort}/${wsPort}`);

var webServer = express();
webServer.listen(httpPort);
webServer.use(express.static(__dirname));
webServer.get('*', function (req, res) {
    res.redirect('/pong');
});

GameServer.listen(wsPort);