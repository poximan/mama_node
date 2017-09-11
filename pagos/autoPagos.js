var amqp = require('amqplib/callback_api');
var bus = require('../eventBus');
require('./ctrlPagos');

process.env.AMQP_URL = require("../cfg.json").url.valor;

amqp.connect(process.env.AMQP_URL, function(err, conn) {
  conn.createChannel(function(err, ch) {

    ch.checkQueue("cola_pagos", function(err, q) {

      ch.consume(q.queue, function(msg) {

        // msg origianl es {fields, properties, content}
        var evento = JSON.parse(msg.content.toString());

        // en función del nombre del evento procesa el mensaje de forma automática
        bus.emit(evento.tarea, evento);
        ch.ack(msg);
      }, {noAck: false});
    });
  });
});

/*
.............................................................
... respuestas simuladas
.............................................................
*/

bus.on("resultadoAutorizacion", function (evento) {
  if(autorizar())
    evento.data.compra.pago.estado = evento.data.compra.pago.estados[1]; // autorizado
  else
    evento.data.compra.pago.estado = evento.data.compra.pago.estados[2]; // rechazado
});

function autorizar() {
  return probabilidad() >= 30;
}

function probabilidad() {
  return Math.random() * 100;
}
