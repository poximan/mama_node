var amqp = require('amqplib/callback_api');
var canal = null;

var amqp_url = require("../cfg.json").amqp.url;

//-----------------------------
var ex = 'exchange';

var publicar = function(regla_ruteo, msg) {

  if(canal === null)
    amqp.connect(amqp_url, function(err, conn) {
      conn.createChannel(function(err, ch) {

        canal = ch;

        var serializacion = Buffer.from(JSON.stringify(msg));
        // para que los mensajes no se pierdan con un reinicio {persistent: true}
        canal.publish(ex, regla_ruteo, serializacion, {persistent: true, contentType: 'application/json'});
      });
    });

  else{
    var serializacion = Buffer.from(JSON.stringify(msg));
    canal.publish(ex, regla_ruteo, serializacion, {persistent: true, contentType: 'application/json'});
  }
}

module.exports = publicar;
