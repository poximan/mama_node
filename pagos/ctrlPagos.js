var bus = require('../eventBus');

/*
param 1 = indice del reloj vectorial que debe incrementar este servidor
param 2 = coleccion mongo donde persite este servidor
param 3 = nombre de la cola MOM que escucha este servidor
param 4 = instancia de bus para gestion de eventos
param 5 = lista de suscriptores del servidor dado
param 6 = cantidad de confirmaciones externas para fin corte consistente
*/
var nucleo = require("../ctrlNucleo")(2, "colecc_pagos", "cola_pagos", bus, "compras.publicaciones", 1);
var mw = nucleo.mw;

// ---------

exports.nucleo = nucleo;
exports.bus = bus;

/*
.............................................................
... mensajes entrantes
.............................................................
*/

bus.on("momAutorizarPago", function (evento) {

  mw.incrementar();

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

  mw.incrementar();

  evento = nucleo.actualizarAtributo(evento);

  console.log("SAL: compra " + evento.id + " --> " + evento.compra.pago);
  mw.publicar("compras.publicaciones", evento);
});

/*
.............................................................
... mensajes internos
.............................................................
*/
