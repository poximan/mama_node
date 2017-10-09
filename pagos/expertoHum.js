// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = require("../cfg.json").monitor.port_pagos;

var _ = require("underscore");
var bus = require('../eventBus');

// Routing
app.use(express.static(__dirname + '/public'));

var preguntas = new Array();

exports.preguntar = function(evento) {
  preguntas.push(evento);
}

io.on('connection', function (socket) {

  socket.on("get", function (msg) {

    preguntas.forEach(function(evento) {
      socket.emit(evento.tarea, evento);
    });
  });

  socket.on("persistir", function (msg) {
    bus.emit("persistir", msg);
  });

  socket.on("resAutorizar", function (msg) {
    var evento = buscarEvento(msg);

    if(evento){
      evento.data.compra.pago.estado = msg.decision;
      evento.tarea = "momResultadoAutorizacion";
      bus.emit(evento.tarea, evento);
    }
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {

  });

  function buscarEvento(msg){

    var evento;

    preguntas = _(preguntas).filter(function(item) {
      if(item.id == msg.id)
        evento = item;
      return item.id != msg.id;
    });

    return evento;
  }
});

server.listen(port, function () {

  console.log("--------------------------");
  console.log('Escuchando en puerto %d', port);
  console.log("--------------------------");
});
