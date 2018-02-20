var bus = require('../eventBus');

//-----------------------------
/*
adapter para suscribirse a una cola, ofrece servicios de escucha al mw.
internamente se conecta con un driver AMQP RabbitMQ.
el mensaje entrante es procesado con JSON.parse y colocado en el bus de mensajes
paramatros:
- cola = nombre de la cola que debe escucharse
*/
module.exports = function(cola) {

  var module = {};

  require("./momSuscriptorRabbit")(cola, getMensaje);

  function getMensaje(buffer){
    var serializacion = JSON.parse(buffer.content.toString());
    bus.emit("mom", serializacion);
  }

  return module;
};
