var amqp = require('amqplib/callback_api');
var publicador = require("../mod_pub");
var bus = require('../eventBus');

/*
.............................................................
... mensajes a MOM
.............................................................
*/

bus.on("autorizarPago", function (evento) {

  evento.tarea = "resultadoAutorizacion";
  bus.emit(evento.tarea, evento);

  console.log("enviando resultado autorizacion pago en compra " + evento.id + " --> " + evento.data.compra.pago.estado);
  publicador("compras.publicaciones", evento);
});

/*
.............................................................
... mensajes internos
.............................................................
*/
