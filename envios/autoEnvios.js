/*
este modulo conoce y agrupa distintas funcionalidades que en su conjunto, dan vida al servidor ejecutado

- se suscribe a una cola para escuchar mensajes entrantes
- le avisa a un mediador que debera atender esos mensajes entrantes y convertirlos (marshalling)
- prepara el control del servidor (la logica que contiene el negocio) para que escucha los eventos
que se desencadenan a partir del marshalling
- delega en un experto la toma de decisiones, basado en probabilidades
*/

var suscriptor = require("../mom/momSuscriptor");
suscriptor("cola_envios");

require('./ctrlEnvios');
var mediador = require("../mom/momMediador");

require('./experto');

// ---------

setInterval(mediador.persistir, 60000);
