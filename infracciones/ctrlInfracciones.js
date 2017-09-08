var amqp = require('amqplib/callback_api');
var publicador = require("../mod_pub");
var bus = require('../eventBus');

bus.on("publicacionSeleccionada", function (evento) {

  evento.tarea = "resultadoInfraccion";
  bus.emit(evento.tarea, evento);

  console.log("enviando resultado infraccion compra " + evento.id + " --> " + evento.data.publicacion.infracciones.estado);
  publicador("compras.ventas", evento);
});
