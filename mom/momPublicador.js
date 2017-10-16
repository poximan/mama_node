var amqp = require('amqplib/callback_api');
var amqp_url = require("../cfg.json").amqp.url;

//-----------------------------

var ex = 'exchange';

exports.publicar = function(regla_ruteo, msg) {

  amqp.connect(amqp_url, function(err, conn) {
    conn.createChannel(function(err, ch) {

      var serializacion = JSON.stringify(msg);
    
      var buffer = Buffer.from(serializacion);
      ch.publish(ex, regla_ruteo, buffer, {persistent: true, contentType: 'application/json'});
    });
  });
}
