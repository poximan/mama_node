var amqp = require('amqplib/callback_api');
var publicador = require("../mod_pub");
var bus = require('../eventBus');

bus.on("calcularCosto", function (evento) {

  evento.tarea = "resultadoCosto";
  bus.emit(evento.tarea, evento);

  console.log("enviando resultado costo compra " + evento.id + " --> " + evento.data.compra.adic_envio.valor);
  publicador("compras", evento);
});
