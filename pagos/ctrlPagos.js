require("../mom/momSuscriptor").suscribir("cola_pagos");

var bus = require('../eventBus');
var mediador = require("../mom/momMediador");

// ---------

mediador.coleccion("colecc_pagos");
mediador.indice(2);
mediador.registroCompras(new Array());
mediador.respuestasCorte(1);
mediador.registroCorte(new Array());

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

  evento = mediador.actualizarAtributo(evento);

  console.log("SAL: compra " + evento.id + " --> " + evento.compra.pago);
  mediador.publicar("compras.publicaciones", evento);
});

/*
.............................................................
... mensajes internos
.............................................................
*/
