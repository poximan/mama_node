var suscriptor = require("../mom/momSuscriptor");
suscriptor.suscribir("cola_envios");
var publicador = require("../mom/momPublicador");
var bus = require('../eventBus');

// ---------

/*
.............................................................
... mensajes MOM entrada-salida
.............................................................
*/

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
