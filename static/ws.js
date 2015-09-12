var client = new WSSHClient();

client.connect({
    onError: function(error) {
        console.error(error);
    },
    onConnect: function() {
        console.debug('Connected!');
        client.sendInitData()
    },
    onClose: function() {
        console.debug('Connection Reset By Peer');
        client.sendCloseData('close')
    },
    onData: function(data) {
        console.debug('Received: ' + data);
    }
});

function WSSHClient() {
};

WSSHClient.prototype._generateEndpoint = function(options) {
    if (window.location.protocol == 'https:') {
        var protocol = 'wss://';
    } else {
        var protocol = 'ws://';
    }
    var endpoint = protocol + window.location.host + '/ws';
    return endpoint;
};

WSSHClient.prototype.connect = function(options) {
    var endpoint = this._generateEndpoint(options);

    if (window.WebSocket) {
        this._connection = new WebSocket(endpoint);
    }
    else if (window.MozWebSocket) {
        this._connection = MozWebSocket(endpoint);
    }
    else {
        options.onError('WebSocket Not Supported');
        return ;
    }

    this._connection.onopen = function() {
        options.onConnect();
    };

    this._connection.onmessage = function (evt) {
        var data = JSON.parse(evt.data.toString());
        if (data.error !== undefined) {
            options.onError(data.error);
        }
        else {
            options.onData(data.data);
        }
    };

    this._connection.onclose = function(evt) {
        options.onClose();
    };
};

WSSHClient.prototype.send = function(data) {
    this._connection.send(JSON.stringify(data));
};

WSSHClient.prototype.sendInitData=function(){
    var data= {
        hostname: 'localhost',
        port: 22,
        username: 'root',
        password: '123456'
    }
    this._connection.send(JSON.stringify({"tp":"init","data":data}))
}

WSSHClient.prototype.sendClientData=function(data){
    this._connection.send(JSON.stringify({"tp":"client","data":data}))
}

WSSHClient.prototype.sendCloseData=function(data){
    this._connection.send(JSON.stringify({"tp":"close","data":data}))
}
