var amqp = require('amqplib/callback_api');
var publicador = require("../mod_pub");
var bus = require('../eventBus');

/*
.............................................................
... mensajes MOM entrada-salida
.............................................................
*/

bus.on("momAutorizarPago", function (evento) {

  evento.tarea = "resultadoAutorizacion";
  bus.emit(evento.tarea, evento);

  console.log("SAL: compra " + evento.id + " --> " + evento.data.compra.pago.estado);

  evento.tarea = "momResultadoAutorizacion";
  publicador("compras.publicaciones", evento);
});

/*
.............................................................
... mensajes internos
.............................................................
*/
