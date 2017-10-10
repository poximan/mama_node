/*
este modulo conoce y agrupa distintas funcionalidades que en su conjunto, dan vida al servidor ejecutado

- le avisa a un mediador que debera atender esos mensajes entrantes y convertirlos (marshalling)
- prepara el control del servidor (la logica que contiene el negocio) para que escucha los eventos
que se desencadenan a partir del marshalling
- delega en un experto la toma de decisiones, basado en probabilidades
*/

var control = require('./ctrlWeb');
var mediador = require("../mom/momMediador");
mediador.coleccion("colecc_web");

var experto = require('./expertoSim');
var bus = require('../eventBus');

// ---------

setInterval(mediador.persistir, 60000);
setInterval(control.comprar, 10000);

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
