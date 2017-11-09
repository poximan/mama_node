var port = require("../cfg.json").monitor.port_envios;
var control = require('./ctrlEnvios');
var monitor = require('../monitorServ')(port, control.nucleo, control.bus);

var bus = control.bus;
var io = monitor.io;

// ---------

bus.on("resultadoCosto", function (evento) {
  monitor.preguntar(evento);
});

/*
.............................................................
... respuestas desde cliente web
.............................................................
*/

io.on('connection', function (socket) {

  socket.on("resCosto", function (msg) {
    var evento = monitor.buscarEvento(msg);

    if(evento){
      evento.compra.adic_envio = msg.decision;
      evento.tarea = "momResultadoCosto";
      bus.emit(evento.tarea, evento);
    }
  });

  monitor.agendarEventos("man");
});
