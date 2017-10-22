// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = require("../cfg.json").manual.monitor.port_monitor;

var conectores = require("./conectador").conectores;

var _ = require("underscore");
var bus = require('../eventBus');

// Routing
app.use(express.static(__dirname + '/public'));

exports.preguntar = function(evento) {
  preguntas.push(evento);
}

io.on('connection', function (socket) {

  socket.on("compras", function (msg) {

    console.log("redireccionando a serv compras");
  });

  socket.on("envios", function (msg) {

    console.log("redireccionando a ServEnvios");

    var comando = msg.message;
    var instancia = msg.instancia;

    if(conectores.c_envios.esValido(comando)){
      conectores.c_envios.socket.emit(comando, instancia);
      conectores.c_envios.retorno(socket);
    }
  });

  socket.on("infracciones", function (msg) {
    console.log("redireccionando a serv infracciones");
  });

  socket.on("pagos", function (msg) {
    console.log("redireccionando a serv pagos");
  });

  socket.on("publicaciones", function (msg) {
    console.log("redireccionando a serv publicaciones");
  });

  socket.on("web", function (msg) {
    console.log("redireccionando a serv web");
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
