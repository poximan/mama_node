var port = require("../cfg.json").manual.monitor.port_compras;
var _ = require("underscore");
var bus = require('../eventBus');

var preguntas = new Array();

exports.preguntar = function(evento) {
  preguntas.push(evento);
}

var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

/*
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/*');
});
*/

io.on('connection', function (socket) {

  socket.on("entrando", function (msg) {
    console.log("Se registro conexion entrante");
  });

  socket.on("get", function (msg) {

    preguntas.forEach(function(evento) {
      socket.emit(evento.tarea, evento);
    });
  });

  socket.on("estado", function (msg) {

    console.log("respondiendo estado del servidor");
    socket.emit("resEstado", preguntas);
  });

  socket.on("persistir", function (msg) {
    bus.emit("persistir", msg);
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {

  });
});

server.listen(port, function () {

  console.log("--------------------------");
  console.log('Escuchando en puerto %d', port);
  console.log("--------------------------");
});
