var suscriptor = require("../mom/momSuscriptor");
suscriptor.suscribir("cola_pagos");
var publicador = require("../mom/momPublicador");

var bus = require('../eventBus');
var mediador = require("../mom/momMediador");

// ---------

mediador.coleccion("colecc_pagos");
mediador.indice(3);

exports.mediador = mediador;
exports.bus = bus;

/*
.............................................................
... mensajes entrantes
.............................................................
*/

bus.on("momAutorizarPago", function (evento) {

  mediador.incrementar();
  console.log("ENT: compra " + evento.id + " --> " + "preguntando si autoriza pago");
  evento.tarea = "resultadoAutorizacion";
  bus.emit(evento.tarea, evento);
});

/*
.............................................................
... mensajes salientes
.............................................................
*/

bus.on("momResultadoAutorizacion", function (evento) {

  mediador.incrementar();
  console.log("SAL: compra " + evento.id + " --> " + evento.data.compra.pago.estado);
  publicador("compras.publicaciones", evento);
});

/*
.............................................................
... mensajes internos
.............................................................
*/
