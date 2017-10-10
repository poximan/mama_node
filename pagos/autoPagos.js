/*
este modulo conoce y agrupa distintas funcionalidades que en su conjunto, dan vida al servidor ejecutado

- le avisa a un mediador que debera atender esos mensajes entrantes y convertirlos (marshalling)
- prepara el control del servidor (la logica que contiene el negocio) para que escucha los eventos
que se desencadenan a partir del marshalling
- delega en un experto la toma de decisiones, basado en probabilidades
*/

require('./ctrlPagos');
var mediador = require("../mom/momMediador");
mediador.coleccion("colecc_pagos");

var experto = require('./expertoSim');
var bus = require('../eventBus');

// ---------

setInterval(mediador.persistir, 60000);

bus.on("resultadoAutorizacion", function (evento) {
  experto.autorizar(evento);

  evento.tarea = "momResultadoAutorizacion";
  bus.emit(evento.tarea, evento);
});
