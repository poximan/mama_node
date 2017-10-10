/*
este modulo conoce y agrupa distintas funcionalidades que en su conjunto, dan vida al servidor ejecutado

- le avisa a un mediador que debera atender esos mensajes entrantes y convertirlos (marshalling)
- prepara el control del servidor (la logica que contiene el negocio) para que escucha los eventos
que se desencadenan a partir del marshalling
*/

var control = require('./ctrlWeb');
var mediador = require("../mom/momMediador");
mediador.coleccion("colecc_web");

var experto = require('./expertoHum');
var bus = require('../eventBus');

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
  "id":"",
  "data" : {
  }
}

bus.emit(get_publicaciones.tarea, get_publicaciones);
