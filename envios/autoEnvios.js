/*
este modulo conoce y agrupa distintas funcionalidades que en su conjunto, dan vida al servidor ejecutado

- agrega el control principal del servidor, donde corre el nucleo del negocio.
- pide el mediador que ya fue agregado por el control.
- pide el bus de mensajes (eventEmitter) que ya fue agregado por el control.
*/

var control = require('./ctrlEnvios');
var mediador = control.mediador;
var bus = control.bus;

var periodo_persistencia = require("../cfg.json").automatico.persistencia.periodo;

// ---------

setInterval(mediador.persistir, periodo_persistencia);

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
