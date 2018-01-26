var amqp = require('amqplib/callback_api');
var amqp_url = require("../globalCfg.json").amqp.url;

//-----------------------------
/*
driver publicador AMQP RabbitMQ
paramatros:
- ex = nombre del exchange que recibira el mensaje ruteado en amqp_url
*/
module.exports = function(ex) {

  var module = {};
  let opciones = {persistent: true, contentType: 'application/json'};

  module.canal;

  amqp.connect(amqp_url, function(err, conn) {
    conn.createChannel(function(err, ch) {
      module.canal = ch;
    });
  });

  module.publicar = function(reglas_ruteo, buffer){
    module.canal.publish(ex, reglas_ruteo, buffer, opciones);
  }

  return module;
};
