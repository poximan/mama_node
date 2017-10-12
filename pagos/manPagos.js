/*
este modulo conoce y agrupa distintas funcionalidades que en su conjunto, dan vida al servidor ejecutado

- agrega el control principal del servidor, donde corre el nucleo del negocio.
- pide el mediador que ya fue agregado por el control.
- pide el bus de mensajes (eventEmitter) que ya fue agregado por el control.
- delega en un experto la toma de decisiones, basado en las respuestas del humano
*/

var control = require('./ctrlPagos');
var mediador = control.mediador;
var bus = control.bus;

var experto = require('./expertoHum');

// ---------

bus.on("resultadoAutorizacion", function (evento) {
  experto.preguntar(evento);
});

bus.on("persistir", function (evento) {
  mediador.persistir();
});
