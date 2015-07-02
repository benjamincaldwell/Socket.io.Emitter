var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var remoteServer = 'http://localhost:3000';
var port = 8888;
var c_io = require('socket.io-client')(remoteServer);
var eventsListening = [ 'hello', 'test'];
var eventsEmitting = [ 'hello' , 'test'];


app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});
app.use(express.static(__dirname + '/public'));

c_io.on('connect', function() {
    console.log('Connection to ' + remoteServer + ' established');
});

http.listen(port, function(){

    console.log('listening on localhost:' + port);
    io.on('connection', function(socket){

        // For each new connection, register & un-register to events
        for (var key in eventsListening) {
            var event = eventsListening[key];
           (function(event){
                c_io.on(event, function(response) {
                    socket.emit(event, response);
                });
            })(event);
        }

        socket.on('disconnect', function() {
            for (var key in eventsListening) {
                var event = eventsListening[key];
                c_io.off(event);
            }
        });


        // Emit events to remote server
        socket.on('event.emit', function(data) {
            c_io.emit(data.event, data.data);
        });

        // Get list to populate client
        socket.on('list.emitting', function() {
            socket.emit('list.emitting.res', eventsEmitting);
        });

        socket.on('list.listening', function() {
            socket.emit('list.listening.res', eventsListening);
        });

    });

});
