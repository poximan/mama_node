#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

//process.env.AMQP_URL = 'amqp://localhost';
process.env.AMQP_URL = 'amqp://cmbsdecq:-tiB--pIwH6F0HO0k6rUEfos_K5U7UpW@crane.rmq.cloudamqp.com/cmbsdecq';

amqp.connect(process.env.AMQP_URL, function(err, conn) {
  conn.createChannel(function(err, ch) {

    var ex = 'exchange';
    // recorta los primeros 2 argumentos, "node" y path
    var reglas_ruteo = process.argv.slice(2);

    // para que las colas no se pierdan con un reinicio {durable: true}
    ch.assertExchange(ex, "topic", {durable: true});

    var nombre_cola = 'cola_' + reglas_ruteo[0];
    ch.assertQueue(nombre_cola, {exclusive: false}, function(err, q) {

      reglas_ruteo.forEach(function(regla_ruteo) {
        ch.bindQueue(q.queue, ex, "#."+regla_ruteo+".#");
      });
    });
  });

  setTimeout(function() { conn.close(); process.exit(0) }, 5000);
});
