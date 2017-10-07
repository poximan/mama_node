var publicador = require("../mom/momPublicador");
var bus = require('../eventBus');

/*
.............................................................
... mensajes MOM entrada-salida
.............................................................
*/

bus.on("momCalcularCosto", function (evento) {

  evento.tarea = "resultadoCosto";
  bus.emit(evento.tarea, evento);

  console.log("SAL: compra " + evento.id + " adic correo --> " + evento.data.compra.adic_envio.valor);

  evento.tarea = "momResultadoCosto";
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
