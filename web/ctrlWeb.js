var amqp = require('amqplib/callback_api');
var publicador = require("../mod_pub");
var bus = require('../eventBus');

/*
.............................................................
... mensajes a MOM
.............................................................
*/

bus.on("publicacionSeleccionada", function (evento) {

  evento.tarea = "resultadoEnvio";
  bus.emit(evento.tarea, evento);

  console.log("enviando resultado forma de entrega compra " + evento.id + " --> " + evento.data.compra.entrega.estado);

  publicador("compras", evento);
});

bus.on("nuevaCompra", function (evento) {
  publicador("compras", evento);
});


bus.on("getPublicaciones", function (evento) {

  console.log("solicitando lista de publicaciones");
  publicador("publicaciones", evento)
});

bus.on("seleccionarMedioPago", function (evento) {

  evento.tarea = "resultadoMedioPago";
  bus.emit(evento.tarea, evento);

  console.log("enviando resultado forma de pago compra " + evento.id + " --> " + evento.data.compra.pago.medio);

  publicador("compras", evento);
});

bus.on("confirmarCompra", function (evento) {

  evento.tarea = "resultadoConfirmar";
  bus.emit(evento.tarea, evento);

  console.log("compra " + evento.id + " --> " + evento.data.compra.estado);

  publicador("compras", evento);
});

/*
.............................................................
... mensajes a internos
.............................................................
*/

bus.on("resultadoPublicaciones", function (evento) {

  console.log("se conocen nuevas publicaciones");

  evento.tarea = "cargarPublicaciones";
  bus.emit(evento.tarea, evento);
});

bus.on("informarInfraccion", function (evento) {

  console.log("compra " + evento.id + " --> " + evento.data.compra.estado + " por infraccion");
  publicador("compras", evento);
});
