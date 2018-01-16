var port = require("../cfg.json").monitor.port_infracciones;
var control = require('./ctrlInfracciones');
var monitor = require('../monitorServ')(port, control.nucleo, control.bus);

var bus = control.bus;
var io = monitor.io;

require("../autoComun")(control.nucleo, bus);

var probab_infraccion = require("../cfg.json").automatico.probabilidad.infraccion;

// ---------

bus.on("resultadoInfraccion", function (evento) {
  existeInfraccion(evento);

  evento.tarea = "momResultadoInfraccion";
  bus.emit(evento.tarea, evento);
});

/*
.............................................................
... respuestas simuladas
.............................................................
*/

existeInfraccion = function(evento) {

  if(probabilidad() <= probab_infraccion)
    evento.compra.infracciones = evento.compra.infracciones_valores[2]; // con_infr
  else
    evento.compra.infracciones = evento.compra.infracciones_valores[1]; // sin_infr
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
