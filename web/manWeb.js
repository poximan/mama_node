/*
este modulo conoce y agrupa distintas funcionalidades que en su conjunto, dan vida al servidor ejecutado

- agrega el control principal del servidor, donde corre el nucleo del negocio.
- pide el mediador que ya fue agregado por el control.
- pide el bus de mensajes (eventEmitter) que ya fue agregado por el control.
- delega en un experto la toma de decisiones, basado en las respuestas del humano
*/

var control = require('./ctrlWeb');
var mediador = control.mediador;
var bus = control.bus;

var experto = require('./expertoHum');

// ---------

bus.on("resultadoFormaEntrega", function (evento) {
  experto.preguntar(evento);
});

bus.on("resultadoMedioPago", function (evento) {
  experto.preguntar(evento);
});

bus.on("resultadoConfirmar", function (evento) {
  experto.preguntar(evento);
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
