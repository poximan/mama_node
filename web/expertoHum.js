// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = require("../cfg.json").monitor.port_web;

var _ = require("underscore");
var bus = require('../eventBus');

// Routing
app.use(express.static(__dirname + '/public'));

var preguntas = new Array();

exports.preguntar = function(evento) {
  preguntas.push(evento);
}

io.on('connection', function (socket) {

  socket.on("pajaron", function (message) {
    console.log("pajaron");

    socket.emit("respuesta", "respondido");
  });

  socket.on("get", function (msg) {

    preguntas.forEach(function(evento) {
      socket.emit(evento.tarea, evento);
    });
  });

  socket.on("resEntrega", function (msg) {

    var evento = {};

    preguntas = _(preguntas).filter(function(item) {
      if(item.id == msg.id)
        evento = item;
      return item.id != msg.id;
    });

    evento.data.compra.entrega.estado = msg.decision;

    evento.tarea = "momResultadoFormaEntrega";
    bus.emit(evento.tarea, evento);
  });

  socket.on("resPago", function (msg) {

    console.log("llego rep");
    console.log(msg.id);
    console.log(msg.decision);
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
