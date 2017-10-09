/*
este modulo conoce y agrupa distintas funcionalidades que en su conjunto, dan vida al servidor ejecutado

- se suscribe a una cola para escuchar mensajes entrantes
- le avisa a un mediador que debera atender esos mensajes entrantes y convertirlos (marshalling)
- prepara el control del servidor (la logica que contiene el negocio) para que escucha los eventos
que se desencadenan a partir del marshalling
- delega en un experto la toma de decisiones, basado en probabilidades
*/

var suscriptor = require("../mom/momSuscriptor");
suscriptor.suscribir("cola_infracciones");

require('./ctrlInfracciones');
var mediador = require("../mom/momMediador");
var experto = require('./experto');
var bus = require('../eventBus');

// ---------

setInterval(mediador.persistir, 60000);

bus.on("resultadoInfraccion", function (evento) {
  experto.existeInfraccion(evento);

  evento.tarea = "momResultadoInfraccion";
  bus.emit(evento.tarea, evento);
});
