var amqp = require('amqplib/callback_api');
var publicador = require("../mod_pub");
var bus = require('../eventBus');

bus.on("publicacionSeleccionada", function (evento) {

  evento.tarea = "resultadoEnvio";
  bus.emit(evento.tarea, evento);

  console.log("enviando resultado forma de entrega compra " + evento.id + " --> " + evento.data.compra.entrega.estado);

  publicador("compras.envios", evento);
});

bus.on("nuevaCompra", function (evento) {
  publicador("compras", evento);
});


bus.on("getPublicaciones", function (evento) {

  console.log("solicitando lista de publicaciones");
  publicador("publicaciones", evento)
});

bus.on("resultadoPublicaciones", function (evento) {

  console.log("se conocen nuevas publicaciones");

  evento.tarea = "cargarPublicaciones";
  bus.emit(evento.tarea, evento);
});
