/*
este modulo conoce y agrupa distintas funcionalidades que en su conjunto, dan vida al servidor ejecutado

- se suscribe a una cola para escuchar mensajes entrantes
- le avisa a un mediador que debera atender esos mensajes entrantes y convertirlos (marshalling)
- prepara el control del servidor (la logica que contiene el negocio) para que escucha los eventos
que se desencadenan a partir del marshalling
- delega en un experto la toma de decisiones, basado en probabilidades
*/

var suscriptor = require("../mom/momSuscriptor");
suscriptor("cola_web");

require('./ctrlWeb');
var mediador = require("../mom/momMediador");
var experto = require('./experto');
var bus = require('../eventBus');

var async = require('async');

// ---------

setInterval(mediador.persistir, 60000);

var publicaciones = [];

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

bus.on("cargarPublicaciones", function (evento) {
  publicaciones = evento.data;
});

/*
.............................................................
... generar nuevas compras usando publicaciones conocidas
.............................................................
*/

function comprar() {

  if(publicaciones.length > 0){

    var operaciones = [
      function(callback) {  // el callback siempre es el ultimo parametro
          var evento = JSON.parse(require('fs').readFileSync('./payload.json', 'utf8'));
          callback(null, evento);
      },
      function(evento, callback) {  // el callback siempre es el ultimo parametro
          evento.data.publicacion = publicaciones[indicePublicacionElegida()];
          callback(null, evento);
      },
      function(evento, callback) {
          evento.tarea = "nuevaCompra";
          callback(null, evento);
      }
    ];
    async.waterfall(operaciones, function (err, evento) {
      bus.emit(evento.tarea, evento);
    });
  }
}
setInterval(comprar, 10000);

function indicePublicacionElegida() {
  return Math.floor(Math.random() * publicaciones.length);
}
