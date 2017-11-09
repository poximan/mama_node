var bus = require('../eventBus');

/*
param 1 = indice del reloj vectorial que debe incrementar este servidor
param 2 = coleccion mongo donde persite este servidor
param 3 = cantidad de respuetas que espera para fin corte consistente
param 4 = nombre de la cola MOM que escucha este servidor
param 5 = instancia de bus para gestion de eventos
*/
var nucleo = require("../ctrlNucleo")(5, "colecc_compras", 4, "cola_compras", bus);
var mw = nucleo.mw;

// ---------

exports.nucleo = nucleo;
exports.bus = bus;

/*
.............................................................
... sincronizacion 1
se espera la llegada de dos mensajes
1) desde servidor compras - compra confirmada
2) desde servidor infracciones - resultado infraccion
.............................................................
*/
var estado_sincro_inf_compr = [];

/*
.............................................................
... mensajes MOM entrada-salida
.............................................................
*/

bus.on("momPublicacionSeleccionada", function (evento) {

  mw.incrementar();

  evento.compra.estado = evento.compra.estado_valores[0]; // generada

  console.log("ENT: procesando nueva compra: id " + evento.id + " --> " + evento.publicacion.descripcion);
  evento = nucleo.actualizarAtributo(evento);
  mw.publicar("web", evento);
});

/*
.............................................................
... mensajes salientes
.............................................................
*/

bus.on("calcularCosto", function (evento) {

  mw.incrementar();

  evento.tarea = "momCalcularCosto";
  mw.publicar("envios", evento);
})

bus.on("seleccionarMedioPago", function (evento) {

  mw.incrementar();

  evento.tarea = "momSeleccionarMedioPago";
  mw.publicar("web", evento);
})

bus.on("confirmarCompra", function (evento) {

  mw.incrementar();

  evento.tarea = "momConfirmarCompra";
  mw.publicar("web", evento);
})

bus.on("informarInfraccion", function (evento) {

  mw.incrementar();

  evento.tarea = "momInformarInfraccion";
  mw.publicar("web", evento);
})

bus.on("informarPagoRechazado", function (evento) {

  mw.incrementar();

  evento.tarea = "momInformarPagoRechazado";
  mw.publicar("web", evento);
})

bus.on("autorizarPago", function (evento) {

  mw.incrementar();

  evento.tarea = "momAutorizarPago";
  mw.publicar("pagos", evento);
})

bus.on("aceptarCompra", function (evento) {

  mw.incrementar();

  evento.tarea = "momAceptarCompra";
  mw.publicar("web", evento);
})

bus.on("agendarEnvio", function (evento) {

  mw.incrementar();

  evento.tarea = "momAgendarEnvio";
  mw.publicar("envios", evento);
})

/*
.............................................................
... mensajes entrante
.............................................................
*/

bus.on("momResultadoFormaEntrega", function (evento) {

  mw.incrementar();
  console.log("ENT: compra " + evento.id + " entrega --> " + evento.compra.entrega);

  evento = nucleo.actualizarAtributo(evento);

  // si el cliente elige metodo de envio correo
  if(evento.compra.entrega === evento.compra.entrega_valores[2]){

    evento.tarea = "calcularCosto";
    bus.emit(evento.tarea, evento);
  }

  // si el cliente elige retirar personalmente
  if(evento.compra.entrega === evento.compra.entrega_valores[1]){

    evento.tarea = "seleccionarMedioPago";
    bus.emit(evento.tarea, evento);
  }
})

bus.on("momResultadoMedioPago", function (evento) {

  mw.incrementar();
  console.log("ENT: compra " + evento.id + " medio-pago --> " + evento.compra.medio);

  evento = nucleo.actualizarAtributo(evento);

  evento.tarea = "confirmarCompra";
  bus.emit(evento.tarea, evento);
})

bus.on("momResultadoCosto", function (evento) {

  mw.incrementar();
  console.log("ENT: compra " + evento.id + " adic correo --> " + evento.compra.adic_envio);

  evento = nucleo.actualizarAtributo(evento);

  evento.tarea = "seleccionarMedioPago";
  bus.emit(evento.tarea, evento);
});

bus.on("momResultadoConfirmar", function (evento) {

  mw.incrementar();
  console.log("ENT: compra " + evento.id + " --> " + evento.compra.estado);

  evento = nucleo.actualizarAtributo(evento);

  nucleo.sumar(estado_sincro_inf_compr, evento.id, 1);
  bus.emit("sincro_inf_compr"+estado_sincro_inf_compr[evento.id], evento);
});

bus.on("momResultadoInfraccion", function (evento) {

  mw.incrementar();
  console.log("ENT: compra " + evento.id + " --> " + evento.compra.infracciones);

  evento = nucleo.actualizarAtributo(evento);

  nucleo.sumar(estado_sincro_inf_compr, evento.id, 2);
  bus.emit("sincro_inf_compr"+estado_sincro_inf_compr[evento.id], evento);
})

bus.on("momResultadoAutorizacion", function (evento) {

  mw.incrementar();
  console.log("ENT: compra " + evento.id + " pago --> " + evento.compra.pago);

  evento = nucleo.actualizarAtributo(evento);

  // si el pago fue rechazado
  if(evento.compra.pago === evento.compra.pago_valores[2]){

    evento.tarea = "informarPagoRechazado";
    bus.emit(evento.tarea, evento);
  }

  // si el pago fue autorizado
  if(evento.compra.pago === evento.compra.pago_valores[1]){

    evento.compra.estado = evento.compra.estado_valores[3]; // aceptada

    console.log("SAL: compra " + evento.id + " --> " + evento.compra.estado + " en sistema");

    evento.tarea = "aceptarCompra";
    bus.emit(evento.tarea, evento);

    // si el cliente elige metodo de envio correo
    if(evento.compra.entrega === evento.compra.entrega_valores[2]){

      evento.tarea = "agendarEnvio";
      bus.emit(evento.tarea, evento);
    }
  }
})

/*
.............................................................
... mensajes internos
.............................................................
*/

/*
.............................................................
... sincronizacion 1
se espera la llegada de dos mensajes
1) desde servidor compras - compra confirmada
2) desde servidor infracciones - resultado infraccion
.............................................................
*/

bus.on("sincro_inf_compr1", function (evento) {
  "ENT: compra " + evento.id +
  console.log("INT: compra " + evento.id + "compra " + evento.id + " --> esperando resultado infraccion");
});

bus.on("sincro_inf_compr2", function (evento) {
  console.log("INT: compra " + evento.id + " --> esperando confirmacion de compra");
});

bus.on("sincro_inf_compr3", function (evento) {

  mw.incrementar();

  // si la compra no registra infracciones
  if(evento.compra.infracciones === evento.compra.infracciones_valores[1]){

    evento.tarea = "autorizarPago";
    bus.emit(evento.tarea, evento);
  }
  // si la compra registra infracciones
  if(evento.compra.infracciones === evento.compra.infracciones_valores[2]){

    evento.tarea = "informarInfraccion";
    bus.emit(evento.tarea, evento);
  }
});
