var suscriptor = require("../mom/momSuscriptor");
suscriptor.suscribir("cola_envios");
var publicador = require("../mom/momPublicador");

var bus = require('../eventBus');
var mediador = require("../mom/momMediador");

// ---------

mediador.coleccion("colecc_envios");
mediador.indice(1);

exports.mediador = mediador;
exports.bus = bus;

/*
.............................................................
... mensajes entrantes
.............................................................
*/

bus.on("momCalcularCosto", function (evento) {

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

  console.log("SAL: compra " + evento.id + " adic correo --> " + evento.data.compra.adic_envio.valor);
  publicador("compras", evento);
});

bus.on("momAgendarEnvio", function (evento) {

  console.log("SAL: compra " + evento.id + " --> agendada");

  evento.tarea = "momResultadoAgendarEnvio";
  publicador("publicaciones", evento);
});

/*
.............................................................
... mensajes internos
.............................................................
*/
