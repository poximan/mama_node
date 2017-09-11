var amqp = require('amqplib/callback_api');
var bus = require('../eventBus');
require('./ctrlInfracciones');

process.env.AMQP_URL = require("../cfg.json").url.valor;

amqp.connect(process.env.AMQP_URL, function(err, conn) {
  conn.createChannel(function(err, ch) {

    ch.checkQueue("cola_infracciones", function(err, q) {

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

bus.on("resultadoInfraccion", function (evento) {
  if(existeInfraccion())
    evento.data.publicacion.infracciones.estado = evento.data.publicacion.infracciones.estados[1]; // con_infr
  else
    evento.data.publicacion.infracciones.estado = evento.data.publicacion.infracciones.estados[2]; // sin_infr
});

function existeInfraccion() {
  return probabilidad() <= 30;
}

function probabilidad() {
  return Math.random() * 100;
}
