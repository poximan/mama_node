var amqp = require('amqplib/callback_api');
var bus = require('../eventBus');
require('./ctrlEnvios');

process.env.AMQP_URL = require("../cfg.json").url.valor;

amqp.connect(process.env.AMQP_URL, function(err, conn) {
  conn.createChannel(function(err, ch) {

    ch.checkQueue("cola_envios", function(err, q) {

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

bus.on("resultadoCosto", function (evento) {
  evento.data.compra.adic_envio.valor = costo();
});

function costo() {
  return Math.ceil(probabilidad());
}

function probabilidad() {
  return Math.random() * 100;
}
