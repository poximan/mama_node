var amqp = require('amqplib/callback_api');
var canal = null;

process.env.AMQP_URL = require("./cfg.json").url.valor;

//-----------------------------
var ex = 'exchange';

var publicar = function(regla_ruteo, msg) {

  if(canal === null)
    amqp.connect(process.env.AMQP_URL, function(err, conn) {
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
