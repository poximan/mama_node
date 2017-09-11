var amqp = require('amqplib/callback_api');
var publicador = require("../mod_pub");
var bus = require('../eventBus');

/*
.............................................................
... mensajes MOM entrada-salida
.............................................................
*/

bus.on("momPublicacionSeleccionada", function (evento) {

  evento.tarea = "resultadoFormaEntrega";
  bus.emit(evento.tarea, evento);

  console.log("SAL: compra " + evento.id + " --> " + evento.data.compra.entrega.estado);

  evento.tarea = "momResultadoFormaEntrega";
  publicador("compras", evento);
});

bus.on("getPublicaciones", function (evento) {

  console.log("SAL: solicitando publicaciones");

  evento.tarea = "momGetPublicaciones";
  publicador("publicaciones", evento)
});

bus.on("momSeleccionarMedioPago", function (evento) {

  evento.tarea = "resultadoMedioPago";
  bus.emit(evento.tarea, evento);

  console.log("SAL: compra " + evento.id + " pago --> " + evento.data.compra.pago.medio);

  evento.tarea = "momResultadoMedioPago";
  publicador("compras", evento);
});

bus.on("momConfirmarCompra", function (evento) {

  evento.tarea = "resultadoConfirmar";
  bus.emit(evento.tarea, evento);

  console.log("SAL: compra " + evento.id + " --> " + evento.data.compra.pago.medio);

  evento.tarea = "momResultadoConfirmar";
  publicador("compras", evento);
});

/*
.............................................................
... mensajes salientes
.............................................................
*/

bus.on("nuevaCompra", function (evento) {
  evento.tarea = "momNuevaCompra";
  publicador("compras", evento);
});

/*
.............................................................
... mensajes entrante
.............................................................
*/

bus.on("momResultadoPublicaciones", function (evento) {

  console.log("SAL: obteniendo nuevas publicaciones");

  evento.tarea = "cargarPublicaciones";
  bus.emit(evento.tarea, evento);
});

bus.on("momInformarInfraccion", function (evento) {
  console.log("ENT: compra " + evento.id + " --> " + evento.data.compra.estado + " por infraccion");
});

bus.on("momInformarPagoRechazado", function (evento) {
  console.log("ENT: compra " + evento.id + " --> " + evento.data.compra.estado + " por pago");
});

bus.on("momAceptarCompra", function (evento) {
  console.log("ENT: compra " + evento.id + " --> " + evento.data.compra.estado);
});

/*
.............................................................
... mensajes internos
.............................................................
*/
