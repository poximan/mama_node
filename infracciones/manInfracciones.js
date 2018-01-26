var port = require("../globalCfg.json").monitor.port_infracciones;
var control = require('./ctrlInfracciones');
var monitor = require('../monitorServ')(port, control.nucleo, control.bus);

var bus = control.bus;
var io = monitor.io;

// ---------

bus.on("resultadoInfraccion", function (evento) {
  monitor.preguntar(evento);
});

/*
.............................................................
... respuestas desde cliente web
.............................................................
*/

io.on('connection', function (socket) {

  socket.on("resInfraccion", function (msg) {
    var evento = monitor.buscarEvento(msg);

    if(evento){
      evento.compra.infracciones = msg.decision;
      evento.tarea = "momResultadoInfraccion";
      bus.emit(evento.tarea, evento);
    }
  });

  monitor.agendarEventos("man");
});
