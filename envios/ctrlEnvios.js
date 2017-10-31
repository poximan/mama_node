require("../mom/momSuscriptor").suscribir("cola_envios");

var bus = require('../eventBus');
var mediador = require("../mom/momMediador");

// ---------

mediador.coleccion("colecc_envios");
mediador.indice(4);
mediador.registroCompras(new Array);

exports.mediador = mediador;
exports.bus = bus;

/*
.............................................................
... mensajes entrantes
.............................................................
*/

bus.on("momCalcularCosto", function (evento) {

  mediador.incrementar();

  console.log("ENT: compra " + evento.id + " --> " + "preguntando costo adicional por correo");
  evento.tarea = "resultadoCosto";
  bus.emit(evento.tarea, evento);
});

/*
.............................................................
... mensajes salientes
.............................................................
*/

bus.on("momResultadoCosto", function (evento) {

  mediador.incrementar();

  console.log("SAL: compra " + evento.id + " adic correo --> " + evento.compra.adic_envio);
  evento = mediador.actualizarAtributo(evento);

  mediador.publicar("compras", evento);
});

bus.on("momAgendarEnvio", function (evento) {

  mediador.incrementar();

  console.log("SAL: compra " + evento.id + " --> agendada");
  evento = mediador.actualizarAtributo(evento);

  evento.tarea = "momResultadoAgendarEnvio";
  mediador.publicar("publicaciones", evento);
});

/*
.............................................................
... mensajes internos
.............................................................
*/
