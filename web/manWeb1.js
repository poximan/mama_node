/*
este modulo conoce y agrupa distintas funcionalidades que en su conjunto, dan vida al servidor ejecutado

- agrega el control principal del servidor, donde corre el nucleo del negocio.
- pide el mediador que ya fue agregado por el control.
- pide el bus de mensajes (eventEmitter) que ya fue agregado por el control.
*/

var control = require('./ctrlWeb');
var mediador = control.mediador;
var bus = control.bus;
var _ = require('underscore');

// ---------

var port = require("../cfg.json").manual.monitor.port_web;
var man_comun = require("../manComun");
man_comun.control(control);
man_comun.puerto(port);

// ---------

bus.on("resultadoFormaEntrega", function (evento) {
  preguntar(evento);
});

bus.on("resultadoMedioPago", function (evento) {
  preguntar(evento);
});

bus.on("resultadoConfirmar", function (evento) {
  preguntar(evento);
});

bus.on("comprar", function (evento) {
  control.comprar();
});

bus.on("persistir", function (evento) {
  mediador.persistir();
});

/*
.............................................................
... pedir publicaciones por unica vez al servidor responsable
.............................................................
*/

var get_publicaciones = {
  "tarea":"momGetPublicaciones",
  "publicaciones" : []
}

bus.emit(get_publicaciones.tarea, get_publicaciones);

/*
.............................................................
... respuestas desde cliente web
.............................................................
*/

var io = man_comun.io;
var preguntas = man_comun.preguntas;

preguntar = function(evento) {
  preguntas.push(evento);
}

io.on('connection', function (socket) {

  socket.on("comprar", function (msg) {
    bus.emit("comprar", msg);
  });

  socket.on("resEntrega", function (msg) {
    var evento = man_comun.buscarEvento(msg);

    if(evento){
      evento.compra.entrega = msg.decision;
      evento.tarea = "momResultadoFormaEntrega";
      bus.emit(evento.tarea, evento);
    }
  });

  socket.on("resPago", function (msg) {

    var evento = man_comun.buscarEvento(msg);

    if(evento){
      evento.compra.medio = msg.decision;
      evento.tarea = "momResultadoMedioPago";
      bus.emit(evento.tarea, evento);
    }
  });

  socket.on("resConfirma", function (msg) {

    var evento = man_comun.buscarEvento(msg);

    if(evento){
      evento.compra.estado = msg.decision;
      evento.tarea = "momResultadoConfirmar";
      bus.emit(evento.tarea, evento);
    }
  });
});
