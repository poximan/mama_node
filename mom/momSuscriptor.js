var amqp = require('amqplib/callback_api');
var bus = require('../eventBus');

var amqp_url = require("../cfg.json").amqp.url;

var cola;

exports.suscribir = function(nombre_cola) {
  cola = nombre_cola;
}

amqp.connect(amqp_url, function(err, conn) {
  conn.createChannel(function(err, ch) {

    ch.checkQueue(cola, function(err, q) {

      ch.consume(q.queue, function(msg) {

        // msg origianl es {fields, properties, content}
        var evento = JSON.parse(msg.content.toString());

        // en función del nombre del evento procesa el mensaje de forma automática
        bus.emit("mom", evento);
        ch.ack(msg);
      }, {noAck: false});
    });
  });
});
