var amqp = require('amqplib/callback_api');
var bus = require('../eventBus');
require('./ctrlWeb');

process.env.AMQP_URL = 'amqp://localhost';

amqp.connect(process.env.AMQP_URL, function(err, conn) {
  conn.createChannel(function(err, ch) {

    ch.checkQueue("cola_web", function(err, q) {

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

bus.on("resultadoEnvio", function (evento) {
  console.log("preguntar al servidor debug");
});

bus.on("resultadoConfirma", function (evento) {
  console.log("preguntar al servidor debug");
});
