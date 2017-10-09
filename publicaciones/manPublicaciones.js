/*
este modulo conoce y agrupa distintas funcionalidades que en su conjunto, dan vida al servidor ejecutado

- se suscribe a una cola para escuchar mensajes entrantes
- le avisa a un mediador que debera atender esos mensajes entrantes y convertirlos (marshalling)
- prepara el control del servidor (la logica que contiene el negocio) para que escucha los eventos
que se desencadenan a partir del marshalling
*/

var suscriptor = require("../mom/momSuscriptor");
suscriptor.suscribir("cola_publicaciones");

require('./ctrlPublicaciones');
var mediador = require("../mom/momMediador");
var experto = require('./expertoHum');
var bus = require('../eventBus');

// ---------

bus.on("persistir", function (evento) {
  mediador.persistir();
});
