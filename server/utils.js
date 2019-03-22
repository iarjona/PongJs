var Utils = {};

Utils.failSafeSend = function(ws, data){
    if (ws.readyState == ws.OPEN) {
        ws.send(JSON.stringify(data));
        return true
    } else {
        return false;
    }
}

module.exports = Utils;