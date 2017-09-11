var amqp = require('amqplib/callback_api');
var bus = require('../eventBus');
require('./ctrlCompras');

process.env.AMQP_URL = require("../cfg.json").amqp.url;

var id_compra = 0;

amqp.connect(process.env.AMQP_URL, function(err, conn) {
  conn.createChannel(function(err, ch) {

    ch.checkQueue("cola_compras", function(err, q) {

      ch.consume(q.queue, function(msg) {

        // msg origianl es {fields, properties, content}
        var evento = JSON.parse(msg.content.toString());

        // primero recupera, si existe, la compra. Si no existe crea una nueva
        if (evento.id === ""){
          evento.id = id_compra++;
        }

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
