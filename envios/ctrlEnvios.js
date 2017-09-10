var amqp = require('amqplib/callback_api');
var publicador = require("../mod_pub");
var bus = require('../eventBus');

/*
.............................................................
... mensajes a MOM
.............................................................
*/

bus.on("calcularCosto", function (evento) {

  evento.tarea = "resultadoCosto";
  bus.emit(evento.tarea, evento);

  console.log("enviando resultado costo compra " + evento.id + " --> " + evento.data.compra.adic_envio.valor);
  publicador("compras", evento);
});

bus.on("agendarEnvio", function (evento) {

  console.log("agendado envio de compra " + evento.id);

  evento.tarea = "resultadoAgendar";
  publicador("publicaciones", evento);
});

/*
.............................................................
... mensajes internos
.............................................................
*/
