var publicador_rabbit = require("./momPublicadorRabbit")("exchange");

//-----------------------------
/*
adapter para publicar, ofrece servicios de publicacion al mw.
internamente se conecta con un driver AMQP RabbitMQ.
usa una cola interna para salvar mensajes que pudieran ser enviados
a publicacion antes que el canal de salida este preparado
*/
module.exports = function() {

  var module = {};

  var publicaciones = [];

  module.publicar = function(reglas_ruteo, msg){

    publicaciones.push({reglas_ruteo, msg});
    if(publicador_rabbit.canal !== undefined)
      vaciarPendientes();
  }

  setInterval(function(){

    if(publicador_rabbit.canal !== undefined)
      vaciarPendientes();
  }, 3000);

  function vaciarPendientes(){
    while (publicaciones.length > 0) {

      var pendiente = publicaciones.pop();
      var serializacion = JSON.stringify(pendiente.msg);
      var buffer = Buffer.from(serializacion);

      publicador_rabbit.publicar(pendiente.reglas_ruteo, buffer);
    }
  }

  return module;
};
