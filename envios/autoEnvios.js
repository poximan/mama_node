var port = require("../globalCfg.json").monitor.port_envios;
var control = require('./ctrlEnvios');
var monitor = require('../monitorServ')(port, control.nucleo, control.bus);

var bus = control.bus;
var io = monitor.io;

require("../autoComun")(control.nucleo, bus);

// ---------

bus.on("resultadoCosto", function (evento) {
  costo(evento);

  evento.tarea = "momResultadoCosto";
  bus.emit(evento.tarea, evento);
});

/*
.............................................................
... respuestas simuladas
.............................................................
*/

costo = function(evento) {
  evento.compra.adic_envio = Math.ceil(probabilidad());
}

function probabilidad() {
  return Math.random() * 100;
}

/*
.............................................................
... respuestas desde cliente web
.............................................................
*/

io.on('connection', function (socket) {
  monitor.agendarEventos("auto");
});
