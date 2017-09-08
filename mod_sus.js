#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

process.env.AMQP_URL = 'amqp://localhost';
//process.env.AMQP_URL = 'amqp://cmbsdecq:-tiB--pIwH6F0HO0k6rUEfos_K5U7UpW@crane.rmq.cloudamqp.com/cmbsdecq';

//-----------------------------

var suscribir = function(eventEmitter, cola) {
  amqp.connect(process.env.AMQP_URL, function(err, conn) {
    conn.createChannel(function(err, ch) {
      ch.checkQueue(cola, function(err, q) {

        ch.consume(q.queue, function(msg) {
          ch.ack(msg);

          // msg origianl es {fields, properties, content}
          var msg_json = JSON.parse(msg.content.toString());
          eventEmitter.emit(msg_json.header, msg_json.payload);

        }, {noAck: false});
      });
    });
  });
}

module.exports = suscribir;
