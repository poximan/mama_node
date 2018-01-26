var amqp = require('amqplib/callback_api');
var amqp_url = require("../globalCfg.json").amqp.url;

//-----------------------------
/*
driver para suscribirse a una cola AMQP RabbitMQ
paramatros:
- cola = nombre de la cola que debe escucharse
- mensajeEntrante = llamada a funcion radicada en el adapter, en donde
el mensaje entrante es procesado y entregado al mw
*/
module.exports = function(cola, mensajeEntrante) {

  var module = {};

  amqp.connect(amqp_url, function(err, conn) {
    conn.createChannel(function(err, ch) {

      ch.checkQueue(cola, function(err, q) {

        ch.consume(q.queue, function(buffer) {
          // msg origianl es {fields, properties, content}
          mensajeEntrante(buffer);
          ch.ack(buffer);
        }, {noAck: false});
      });
    });
  });

  return module;
};
