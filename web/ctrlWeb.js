var publicador = require("../mom/momPublicador");
var bus = require('../eventBus');

/*
.............................................................
... mensajes MOM entrada-salida
.............................................................
*/


/*
.............................................................
... mensajes entrantes
.............................................................
*/

bus.on("momPublicacionSeleccionada", function (evento) {

  evento.tarea = "resultadoFormaEntrega";
  bus.emit(evento.tarea, evento);
});

bus.on("momSeleccionarMedioPago", function (evento) {

  evento.tarea = "resultadoMedioPago";
  bus.emit(evento.tarea, evento);
});

bus.on("momConfirmarCompra", function (evento) {

  evento.tarea = "resultadoConfirmar";
  bus.emit(evento.tarea, evento);
});

bus.on("momInformarInfraccion", function (evento) {
  console.log("ENT: compra " + evento.id + " --> " + evento.data.compra.estado + " por infraccion");
});

bus.on("momInformarPagoRechazado", function (evento) {
  console.log("ENT: compra " + evento.id + " --> " + evento.data.compra.estado + " por pago");
});

bus.on("momAceptarCompra", function (evento) {
  console.log("ENT: compra " + evento.id + " --> " + evento.data.compra.estado + " en sistema");
});

/*
.............................................................
... mensajes salientes
.............................................................
*/

bus.on("momGetPublicaciones", function (evento) {

  console.log("SAL: solicitando publicaciones");

  evento.tarea = "momGetPublicaciones";
  publicador("publicaciones", evento)
});

bus.on("nuevaCompra", function (evento) {
  evento.tarea = "momNuevaCompra";
  publicador("compras", evento);
});

bus.on("momResultadoFormaEntrega", function (evento) {

  console.log("SAL: compra " + evento.id + " --> " + evento.data.compra.entrega.estado);
  publicador("compras", evento);
});

bus.on("momResultadoMedioPago", function (evento) {

  console.log("SAL: compra " + evento.id + " --> " + evento.data.compra.pago.medio);
  publicador("compras", evento);
});

bus.on("momResultadoConfirmar", function (evento) {

  console.log("SAL: compra " + evento.id + " --> " + evento.data.compra.estado + " por cliente");
  publicador("compras", evento);
});

/*
.............................................................
... mensajes internos
.............................................................
*/

bus.on("momResultadoPublicaciones", function (evento) {

  console.log("SAL: obteniendo nuevas publicaciones");

  evento.tarea = "cargarPublicaciones";
  bus.emit(evento.tarea, evento);
});
