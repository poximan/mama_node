var port = require("../cfg.json").monitor.port_web;
var control = require('./ctrlWeb');
var monitor = require('../monitorServ')(port, control.nucleo, control.bus);

var bus = control.bus;
var io = monitor.io;

// ---------

bus.on("resultadoFormaEntrega", function (evento) {
  monitor.preguntar(evento);
});

bus.on("resultadoMedioPago", function (evento) {
  monitor.preguntar(evento);
});

bus.on("resultadoConfirmar", function (evento) {
  monitor.preguntar(evento);
});

bus.on("comprar", function (evento) {
  control.comprar();
});

/*
.............................................................
... pedir publicaciones por unica vez al servidor responsable
.............................................................
*/

var get_publicaciones = {
  "tarea":"momGetPublicaciones",
  "id": 1,
  "publicaciones" : []
}

bus.emit(get_publicaciones.tarea, get_publicaciones);

/*
.............................................................
... respuestas desde cliente web
.............................................................
*/

io.on('connection', function (socket) {

  socket.on("comprar", function (msg) {
    bus.emit("comprar", msg);
  });

  socket.on("resEntrega", function (msg) {
    var evento = monitor.buscarEvento(msg);

    if(evento){
      evento.compra.entrega = msg.decision;
      evento.tarea = "momResultadoFormaEntrega";
      bus.emit(evento.tarea, evento);
    }
  });

  socket.on("resPago", function (msg) {

    var evento = monitor.buscarEvento(msg);

    if(evento){
      evento.compra.medio = msg.decision;
      evento.tarea = "momResultadoMedioPago";
      bus.emit(evento.tarea, evento);
    }
  });

  socket.on("resConfirma", function (msg) {

    var evento = monitor.buscarEvento(msg);

    if(evento){
      evento.compra.estado = msg.decision;
      evento.tarea = "momResultadoConfirmar";
      bus.emit(evento.tarea, evento);
    }
  });
  monitor.agendarEventos("man");
});
