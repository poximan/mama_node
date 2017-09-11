#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

process.env.AMQP_URL = require("../cfg.json").url.valor;

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
