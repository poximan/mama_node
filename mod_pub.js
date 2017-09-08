var amqp = require('amqplib/callback_api');
var canal = null;

//process.env.AMQP_URL = 'amqp://localhost';
process.env.AMQP_URL = 'amqp://cmbsdecq:-tiB--pIwH6F0HO0k6rUEfos_K5U7UpW@crane.rmq.cloudamqp.com/cmbsdecq';

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
