var amqp = require('amqplib/callback_api');
var amqp_url = require("../cfg.json").amqp.url;

//-----------------------------

module.exports = function() {

  var module = {};

  var ex = 'exchange';
  var canal;
  var publicaciones = [];

  amqp.connect(amqp_url, function(err, conn) {
    conn.createChannel(function(err, ch) {
      canal = ch;
    });
  });

  module.publicar = function(reglas_ruteo, msg){

    publicaciones.push({reglas_ruteo, msg});
    if(canal !== undefined)
      vaciarPendientes();
  }

  setInterval(function(){
    if(canal !== undefined && publicaciones.length > 0)
      vaciarPendientes();
  }, 1000);

  function vaciarPendientes(){
    while (publicaciones.length > 0) {

      var pendiente = publicaciones.pop();
      var serializacion = JSON.stringify(pendiente.msg);
      var buffer = Buffer.from(serializacion);

      canal.publish(ex, pendiente.reglas_ruteo, buffer, {persistent: true, contentType: 'application/json'});
    }
  }

  return module;
};
