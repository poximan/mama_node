// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = require("../globalCfg.json").monitor.port_monitor;

var c_compras = require("./conectores/conecCompras").conector;
var c_envios = require("./conectores/conecEnvios").conector;
var c_infracciones = require("./conectores/conecInfracciones").conector;
var c_pagos = require("./conectores/conecPagos").conector;
var c_publicaciones = require("./conectores/conecPublicaciones").conector;
var c_web = require("./conectores/conecWeb").conector;

// Routing
app.use(express.static(__dirname + '/public'));

exports.preguntar = function(evento) {
  preguntas.push(evento);
}

io.on('connection', function (socket) {

  socket.on('connect', () => {
    console.log("Monitor: conectado");
  });

  socket.on("general", function (msg) {
  });

  socket.on("compras", function (msg) {

    console.log("redireccionando a ServCompras");

    var comando = msg.message;
    var instancia = msg.instancia;

    if(c_compras.esValido(comando)){
      c_compras.socket.emit(comando, instancia);
      c_compras.retorno(socket);
    }
  });

  socket.on("envios", function (msg) {

    console.log("redireccionando a ServEnvios");

    var comando = msg.message;
    var instancia = msg.instancia;

    if(c_envios.esValido(comando)){
      c_envios.socket.emit(comando, instancia);
      c_envios.retorno(socket);
    }
  });

  socket.on("infracciones", function (msg) {

    console.log("redireccionando a ServInfracciones");

    var comando = msg.message;
    var instancia = msg.instancia;

    if(c_infracciones.esValido(comando)){
      c_infracciones.socket.emit(comando, instancia);
      c_infracciones.retorno(socket);
    }
  });

  socket.on("pagos", function (msg) {

    console.log("redireccionando a ServPagos");

    var comando = msg.message;
    var instancia = msg.instancia;

    if(c_pagos.esValido(comando)){
      c_pagos.socket.emit(comando, instancia);
      c_pagos.retorno(socket);
    }
  });

  socket.on("publicaciones", function (msg) {

    console.log("redireccionando a ServPublicaciones");

    var comando = msg.message;
    var instancia = msg.instancia;

    if(c_publicaciones.esValido(comando)){
      c_publicaciones.socket.emit(comando, instancia);
      c_publicaciones.retorno(socket);
    }
  });

  socket.on("web", function (msg) {

    console.log("redireccionando a ServWeb");

    var comando = msg.message;
    var instancia = msg.instancia;

    if(c_web.esValido(comando)){
      c_web.socket.emit(comando, instancia);
      c_web.retorno(socket);
    }
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
  });
});

server.listen(port, function () {

  console.log("-----------------------------------");
  console.log("MONITOR ---------------------------");
  console.log('Escuchando en puerto %d ---------', port);
  console.log("-----------------------------------");
});
