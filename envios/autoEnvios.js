var amqp = require('amqplib/callback_api');
var bus = require('../eventBus');
require('./ctrlEnvios');

//process.env.AMQP_URL = "amqp://localhost";
process.env.AMQP_URL = 'amqp://cmbsdecq:-tiB--pIwH6F0HO0k6rUEfos_K5U7UpW@crane.rmq.cloudamqp.com/cmbsdecq';

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

bus.on("resultadoCosto", function (evento) {
  evento.data.compra.adic_envio.valor = costo();
});

function costo() {
  return Math.ceil(probabilidad());
}

function probabilidad() {
  return Math.random() * 100;
}
