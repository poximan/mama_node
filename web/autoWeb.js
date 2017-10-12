/*
este modulo conoce y agrupa distintas funcionalidades que en su conjunto, dan vida al servidor ejecutado

- agrega el control principal del servidor, donde corre el nucleo del negocio.
- pide el mediador que ya fue agregado por el control.
- pide el bus de mensajes (eventEmitter) que ya fue agregado por el control.
- delega en un experto la toma de decisiones, basado en probabilidades
*/

var control = require('./ctrlWeb');
var mediador = control.mediador;
var bus = control.bus;

var experto = require('./expertoSim');

// ---------

setInterval(mediador.persistir, 60000);
setInterval(control.comprar, 1000);
setInterval(control.comprar, 1000);

// ---------

bus.on("resultadoFormaEntrega", function (evento) {
  experto.metodoEnvio(evento);

  evento.tarea = "momResultadoFormaEntrega";
  bus.emit(evento.tarea, evento);
});

bus.on("resultadoMedioPago", function (evento) {
  experto.metodoPago(evento);

  evento.tarea = "momResultadoMedioPago";
  bus.emit(evento.tarea, evento);
});

bus.on("resultadoConfirmar", function (evento) {
  experto.confirmar(evento);

  evento.tarea = "momResultadoConfirmar";
  bus.emit(evento.tarea, evento);
});

/*
.............................................................
... pedir publicaciones por unica vez al servidor responsable
.............................................................
*/

var get_publicaciones = {
  "tarea":"momGetPublicaciones",
  "id":"",
  "data" : {
  }
}

bus.emit(get_publicaciones.tarea, get_publicaciones);
