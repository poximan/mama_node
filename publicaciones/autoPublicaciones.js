/*
este modulo conoce y agrupa distintas funcionalidades que en su conjunto, dan vida al servidor ejecutado

- agrega el control principal del servidor, donde corre el nucleo del negocio.
- pide el mediador que ya fue agregado por el control.
- pide el bus de mensajes (eventEmitter) que ya fue agregado por el control.
*/

var control = require('./ctrlPublicaciones');
var mediador = control.mediador;
var bus = control.bus;

var periodo_persistencia = require("../cfg.json").automatico.persistencia.periodo;

// ---------

setInterval(mediador.persistir, periodo_persistencia);

// ---------

bus.on("resultadoStock", function (publicacion) {
  publicacion.cantidad = cantidad();
});

/*
.............................................................
... respuestas simuladas
.............................................................
*/

cantidad = function() {
  return Math.ceil(probabilidad());
}

function probabilidad() {
  return Math.random() * 10;
}
