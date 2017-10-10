/*
este modulo conoce y agrupa distintas funcionalidades que en su conjunto, dan vida al servidor ejecutado

- se suscribe a una cola para escuchar mensajes entrantes
- le avisa a un mediador que debera atender esos mensajes entrantes y convertirlos (marshalling)
- prepara el control del servidor (la logica que contiene el negocio) para que escucha los eventos
que se desencadenan a partir del marshalling
*/

require('./ctrlEnvios');
var mediador = require("../mom/momMediador");
mediador.coleccion("colecc_envios");

var experto = require('./expertoHum');
var bus = require('../eventBus');

// ---------

bus.on("resultadoCosto", function (evento) {
  experto.preguntar(evento);
});

bus.on("persistir", function (evento) {
  mediador.persistir();
});
