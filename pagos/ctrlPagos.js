require("../mom/momSuscriptor").suscribir("cola_pagos");

var bus = require('../eventBus');

/*
param 1 = indice del que es responsable en reloj vectorial
param 2 = coleccion en donde persiten sus documentos este servidor
param 3 = cantidad de respuetas que espera para fin corte consistente
*/
var mediador = require("../mom/momMediador")(2, "colecc_pagos", 1);

// ---------

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
