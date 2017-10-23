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

    console.log("redireccionando a ServCompras");

    var comando = msg.message;
    var instancia = msg.instancia;

    if(conectores.c_compras.esValido(comando)){
      conectores.c_compras.socket.emit(comando, instancia);
      conectores.c_compras.retorno(socket);
    }
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

    console.log("redireccionando a ServInfracciones");

    var comando = msg.message;
    var instancia = msg.instancia;

    if(conectores.c_infracciones.esValido(comando)){
      conectores.c_infracciones.socket.emit(comando, instancia);
      conectores.c_infracciones.retorno(socket);
    }
  });

  socket.on("pagos", function (msg) {

    console.log("redireccionando a ServPagos");

    var comando = msg.message;
    var instancia = msg.instancia;

    if(conectores.c_pagos.esValido(comando)){
      conectores.c_pagos.socket.emit(comando, instancia);
      conectores.c_pagos.retorno(socket);
    }
  });

  socket.on("publicaciones", function (msg) {

    console.log("redireccionando a ServPublicaciones");

    var comando = msg.message;
    var instancia = msg.instancia;

    if(conectores.c_publicaciones.esValido(comando)){
      conectores.c_publicaciones.socket.emit(comando, instancia);
      conectores.c_publicaciones.retorno(socket);
    }
  });

  socket.on("web", function (msg) {

    console.log("redireccionando a ServWeb");

    var comando = msg.message;
    var instancia = msg.instancia;

    if(conectores.c_web.esValido(comando)){
      conectores.c_web.socket.emit(comando, instancia);
      conectores.c_web.retorno(socket);
    }
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
