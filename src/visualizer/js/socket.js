var supportsWebSockets = 'WebSocket' in window || 'MozWebSocket' in window;
if (!supportsWebSockets) {
	alert("Your browser does not support WebSocket(s). Try a modern browser!");
} else {
	openSocket();
}

function openSocket() {
	var wsUri = "ws://localhost:8888/socket";
    websocket = new WebSocket(wsUri);
    websocket.onopen = function(evt) { onOpen(evt) };
    websocket.onclose = function(evt) { onClose(evt) };
    websocket.onmessage = function(evt) { onMessage(evt) };
    websocket.onerror = function(evt) { onError(evt) };
}

function onOpen(evt) {
    console.log("CONNECTED");
}

function onClose(evt) {
    console.log("DISCONNECTED");
}

function onMessage(evt) {
	var files = JSON.parse(evt.data);
	for (var i = 0; i < files.length; i++) {
		var fl = files[i];
		addPathToTree(fl.path, fl.size);
	}
}

function onError(evt) {
    console.log('ERROR: ' + evt.data);
}