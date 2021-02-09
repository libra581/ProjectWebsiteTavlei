var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO.listen(server);//socketIO(server)

app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));
app.use('/style', express.static(__dirname + '/style'));
app.use('/', express.static(__dirname + '/'));

var game_logic = require('./game-logic');

// Маршруты
app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, 'index.html'));
});

// Запуск сервера
server.listen(5000, '127.0.0.1', function() {//127.0.0.1 25.83.39.199
    console.log('Запускаю сервер на порте 5000');
});

//test message
setInterval(function() {
    io.sockets.emit('message', 'hi!');
}, 1000);


io.on('connection', function(socket) {
  game_logic.initGame(io, socket);
});


