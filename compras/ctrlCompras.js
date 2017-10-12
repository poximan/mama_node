var suscriptor = require("../mom/momSuscriptor");
suscriptor.suscribir("cola_compras");
var publicador = require("../mom/momPublicador");

var bus = require('../eventBus');
var mediador = require("../mom/momMediador");

// ---------

mediador.coleccion("colecc_compras");
mediador.indice(0);

exports.mediador = mediador;
exports.bus = bus;

// ---------

var value = 0,      // valor inicial
    size  = 10000,  // tamaño del arreglo
    estado_sincro_inf_compr = Array.apply(null,{length: size}).map(function() { return value; });

/*
la concurrencia del sistema impide saber que mensaje llegara primero.
para evitar la posible perdida de la respuesta desde el servidor de infracciones
se salva el valor aqui, para luego ser recuperado en el punto de sincronizacion
*/
var estado_inf = null;

/*
.............................................................
... mensajes MOM entrada-salida
.............................................................
*/

bus.on("momNuevaCompra", function (evento) {

  evento.data.compra.estado = evento.data.compra.estados[0]; // generada

  console.log("SAL: nueva compra. id " + evento.id + " --> " + evento.data.publicacion.descripcion.valor);

  evento.tarea = "momPublicacionSeleccionada";
  publicador("web.infracciones.publicaciones", evento)
});

/*
.............................................................
... mensajes salientes
.............................................................
*/

bus.on("calcularCosto", function (evento) {
  evento.tarea = "momCalcularCosto";
  publicador("envios", evento)
})

bus.on("seleccionarMedioPago", function (evento) {
  evento.tarea = "momSeleccionarMedioPago";
  publicador("web", evento)
})

bus.on("confirmarCompra", function (evento) {
  evento.tarea = "momConfirmarCompra";
  publicador("web", evento)
})

bus.on("informarInfraccion", function (evento) {
  evento.tarea = "momInformarInfraccion";
  publicador("web", evento)
})

bus.on("informarPagoRechazado", function (evento) {
  evento.tarea = "momInformarPagoRechazado";
  publicador("web", evento)
})

bus.on("autorizarPago", function (evento) {
  evento.tarea = "momAutorizarPago";
  publicador("pagos", evento)
})

bus.on("aceptarCompra", function (evento) {
  evento.tarea = "momAceptarCompra";
  publicador("web", evento)
})

bus.on("agendarEnvio", function (evento) {
  evento.tarea = "momAgendarEnvio";
  publicador("envios", evento)
})

/*
.............................................................
... mensajes entrante
.............................................................
*/

bus.on("momResultadoFormaEntrega", function (evento) {
  console.log("ENT: compra " + evento.id + " entrega --> " + evento.data.compra.entrega.estado);

  // si el cliente elige metodo de envio correo
  if(evento.data.compra.entrega.estado === evento.data.compra.entrega.estados[2]){

    evento.tarea = "calcularCosto";
    bus.emit(evento.tarea, evento);
  }

  // si el cliente elige retirar personalmente
  if(evento.data.compra.entrega.estado === evento.data.compra.entrega.estados[1]){

    evento.tarea = "seleccionarMedioPago";
    bus.emit(evento.tarea, evento);
  }
})

bus.on("momResultadoMedioPago", function (evento) {
  console.log("ENT: compra " + evento.id + " pago --> " + evento.data.compra.pago.medio);

  evento.tarea = "confirmarCompra";
  bus.emit(evento.tarea, evento);
})

bus.on("momResultadoCosto", function (evento) {
  console.log("ENT: compra " + evento.id + " adic correo --> " + evento.data.compra.adic_envio.valor);

  evento.tarea = "seleccionarMedioPago";
  bus.emit(evento.tarea, evento);
});

bus.on("momResultadoConfirmar", function (evento) {
  console.log("ENT: compra " + evento.id + " --> " + evento.data.compra.estado);

  estado_sincro_inf_compr[evento.id] += 1;
  bus.emit("sincro_inf_compr"+estado_sincro_inf_compr[evento.id], evento);
});

bus.on("momResultadoInfraccion", function (evento) {
  console.log("ENT: compra " + evento.id + " --> " + evento.data.publicacion.infracciones.estado);

  estado_inf = evento.data.publicacion.infracciones.estado;

  estado_sincro_inf_compr[evento.id] += 2;
  bus.emit("sincro_inf_compr"+estado_sincro_inf_compr[evento.id], evento);
})

bus.on("momResultadoAutorizacion", function (evento) {
  console.log("ENT: compra " + evento.id + " pago --> " + evento.data.compra.pago.estado);

  // si el pago fue rechazado
  if(evento.data.compra.pago.estado === "rechazado"){

    evento.tarea = "informarPagoRechazado";
    bus.emit(evento.tarea, evento);
  }

  // si el pago fue autorizado
  if(evento.data.compra.pago.estado === "autorizado"){

    evento.data.compra.estado = evento.data.compra.estados[3]; // aceptada

    evento.tarea = "aceptarCompra";
    bus.emit(evento.tarea, evento);

    // si el cliente elige metodo de envio correo
    if(evento.data.compra.entrega.estado === evento.data.compra.entrega.estados[2]){

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
... sincronizacion
.............................................................
*/

bus.on("sincro_inf_compr1", function (evento) {
});

bus.on("sincro_inf_compr2", function (evento) {
});

bus.on("sincro_inf_compr3", function (evento) {

  evento.data.publicacion.infracciones.estado = estado_inf;
  estado_inf = null;

  // si la compra no registra infracciones
  if(evento.data.publicacion.infracciones.estado === evento.data.publicacion.infracciones.estados[2]){

    evento.tarea = "autorizarPago";
    bus.emit(evento.tarea, evento);
  }

  // si la compra registra infracciones
  if(evento.data.publicacion.infracciones.estado === evento.data.publicacion.infracciones.estados[1]){

    evento.data.compra.estado = evento.data.compra.estados[2];
    evento.tarea = "informarInfraccion";
    bus.emit(evento.tarea, evento);
  }
});
