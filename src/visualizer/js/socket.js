var wsUri = "ws://localhost:8888";
testWebSocket();

function testWebSocket() {
    websocket = new WebSocket(wsUri);
    websocket.onopen = function(evt) { onOpen(evt) };
    websocket.onclose = function(evt) { onClose(evt) };
    websocket.onmessage = function(evt) { onMessage(evt) };
    websocket.onerror = function(evt) { onError(evt) };
}

function onOpen(evt) {
    log("CONNECTED");
}

function onClose(evt) {
    log("DISCONNECTED");
}

function onMessage(evt) {
    // log('Recieved: ' + evt.data);
	var files = JSON.parse(evt.data.replace('(', '[').replace(')', ']'));
	for (var i = 0; i < files.length; i++) {
		var fl = files[i];
		console.log("added:", fl);
		addPathToTree(fl);
	}
    // websocket.close();
}

function onError(evt) {
    log('ERROR: ' + evt.data);
}

function log(message) {
    console.log(message);
}