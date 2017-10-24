/*
este modulo conoce y agrupa distintas funcionalidades que en su conjunto, dan vida al servidor ejecutado

- agrega el control principal del servidor, donde corre el nucleo del negocio.
- pide el mediador que ya fue agregado por el control.
- pide el bus de mensajes (eventEmitter) que ya fue agregado por el control.
*/

var control = require('./ctrlInfracciones');
var mediador = control.mediador;
var bus = control.bus;

var periodo_persistencia = require("../cfg.json").automatico.persistencia.periodo;
var probab_infraccion = require("../cfg.json").automatico.probabilidad.infraccion;

// ---------

setInterval(mediador.persistir, periodo_persistencia);

// ---------

bus.on("resultadoInfraccion", function (evento) {
  experto.existeInfraccion(evento);

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
