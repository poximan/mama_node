require("../mom/momSuscriptor").suscribir("cola_compras");

var bus = require('../eventBus');

/*
param 1 = indice del que es responsable en reloj vectorial
param 2 = coleccion en donde persiten sus documentos este servidor
param 3 = cantidad de respuetas que espera para fin corte consistente
*/
var mediador = require("../mom/momMediador")(5, "colecc_compras", 4);

// ---------

exports.mediador = mediador;
exports.bus = bus;

// ---------

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

  mediador.incrementar();

  evento.compra.estado = evento.compra.estado_valores[0]; // generada

  console.log("ENT: procesando nueva compra: id " + evento.id + " --> " + evento.publicacion.descripcion);
  evento = mediador.actualizarAtributo(evento);
  mediador.publicar("web", evento);
});

/*
.............................................................
... mensajes salientes
.............................................................
*/

bus.on("calcularCosto", function (evento) {

  mediador.incrementar();

  evento.tarea = "momCalcularCosto";
  mediador.publicar("envios", evento);
})

bus.on("seleccionarMedioPago", function (evento) {

  mediador.incrementar();

  evento.tarea = "momSeleccionarMedioPago";
  mediador.publicar("web", evento);
})

bus.on("confirmarCompra", function (evento) {

  mediador.incrementar();

  evento.tarea = "momConfirmarCompra";
  mediador.publicar("web", evento);
})

bus.on("informarInfraccion", function (evento) {

  mediador.incrementar();

  evento.tarea = "momInformarInfraccion";
  mediador.publicar("web", evento);
})

bus.on("informarPagoRechazado", function (evento) {

  mediador.incrementar();

  evento.tarea = "momInformarPagoRechazado";
  mediador.publicar("web", evento);
})

bus.on("autorizarPago", function (evento) {

  mediador.incrementar();

  evento.tarea = "momAutorizarPago";
  mediador.publicar("pagos", evento);
})

bus.on("aceptarCompra", function (evento) {

  mediador.incrementar();

  evento.tarea = "momAceptarCompra";
  mediador.publicar("web", evento);
})

bus.on("agendarEnvio", function (evento) {

  mediador.incrementar();

  evento.tarea = "momAgendarEnvio";
  mediador.publicar("envios", evento);
})

/*
.............................................................
... mensajes entrante
.............................................................
*/

bus.on("momResultadoFormaEntrega", function (evento) {

  mediador.incrementar();
  console.log("ENT: compra " + evento.id + " entrega --> " + evento.compra.entrega);

  evento = mediador.actualizarAtributo(evento);

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

  mediador.incrementar();
  console.log("ENT: compra " + evento.id + " medio-pago --> " + evento.compra.medio);

  evento = mediador.actualizarAtributo(evento);

  evento.tarea = "confirmarCompra";
  bus.emit(evento.tarea, evento);
})

bus.on("momResultadoCosto", function (evento) {

  mediador.incrementar();
  console.log("ENT: compra " + evento.id + " adic correo --> " + evento.compra.adic_envio);

  evento = mediador.actualizarAtributo(evento);

  evento.tarea = "seleccionarMedioPago";
  bus.emit(evento.tarea, evento);
});

bus.on("momResultadoConfirmar", function (evento) {

  mediador.incrementar();
  console.log("ENT: compra " + evento.id + " --> " + evento.compra.estado);

  evento = mediador.actualizarAtributo(evento);

  sumar(estado_sincro_inf_compr, evento.id, 1);
  bus.emit("sincro_inf_compr"+estado_sincro_inf_compr[evento.id], evento);
});

bus.on("momResultadoInfraccion", function (evento) {

  mediador.incrementar();
  console.log("ENT: compra " + evento.id + " --> " + evento.compra.infracciones);

  evento = mediador.actualizarAtributo(evento);

  sumar(estado_sincro_inf_compr, evento.id, 2);
  bus.emit("sincro_inf_compr"+estado_sincro_inf_compr[evento.id], evento);
})

bus.on("momResultadoAutorizacion", function (evento) {

  mediador.incrementar();
  console.log("ENT: compra " + evento.id + " pago --> " + evento.compra.pago);

  evento = mediador.actualizarAtributo(evento);

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

  mediador.incrementar();

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

/*
.............................................................
... auxiliar
.............................................................
*/

function sumar(estado_sincro, indice_objetivo, incremento){

  while(estado_sincro.length <= indice_objetivo)
    estado_sincro.push(0);

  estado_sincro[indice_objetivo] += incremento;
}
