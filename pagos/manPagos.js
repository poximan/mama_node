var port = require("../cfg.json").monitor.port_pagos;
var control = require('./ctrlPagos');
var monitor = require('../monitorServ')(port, control);

var bus = monitor.bus;
var io = monitor.io;

// ---------

bus.on("resultadoAutorizacion", function (evento) {
  monitor.preguntar(evento);
});

/*
.............................................................
... respuestas desde cliente web
.............................................................
*/

io.on('connection', function (socket) {

  socket.on("resAutorizar", function (msg) {
    var evento = monitor.buscarEvento(msg);

    if(evento){
      evento.compra.pago = msg.decision;
      evento.tarea = "momResultadoAutorizacion";
      bus.emit(evento.tarea, evento);
    }
  });

  monitor.agendarEventos("man");
});
