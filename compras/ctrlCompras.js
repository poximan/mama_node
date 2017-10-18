require("../mom/momSuscriptor").suscribir("cola_compras");

var publicador = require("../mom/momPublicador");

var bus = require('../eventBus');
var mediador = require("../mom/momMediador");

// ---------

mediador.coleccion("colecc_compras");
mediador.indice(5);

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

  mediador.incrementar();

  evento.compra.estado = evento.compra.estados[0]; // generada

  console.log("ENT: procesando nueva compra: id " + evento.id + " --> " + evento.publicacion.descripcion);

  evento.tarea = "momPublicacionSeleccionada";
  mediador.publicar("web.infracciones.publicaciones", evento);
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
  console.log("ENT: compra " + evento.id + " pago --> " + evento.compra.medio);

  evento.tarea = "confirmarCompra";
  bus.emit(evento.tarea, evento);
})

bus.on("momResultadoCosto", function (evento) {

  mediador.incrementar();
  console.log("ENT: compra " + evento.id + " adic correo --> " + evento.compra.adic_envio);

  evento.tarea = "seleccionarMedioPago";
  bus.emit(evento.tarea, evento);
});

bus.on("momResultadoConfirmar", function (evento) {

  mediador.incrementar();
  console.log("ENT: compra " + evento.id + " --> " + evento.compra.estado);

  estado_sincro_inf_compr[evento.id] += 1;
  bus.emit("sincro_inf_compr"+estado_sincro_inf_compr[evento.id], evento);
});

bus.on("momResultadoInfraccion", function (evento) {

  mediador.incrementar();
  console.log("ENT: compra " + evento.id + " --> " + evento.compra.infracciones);

  estado_inf = evento.compra.infracciones;

  estado_sincro_inf_compr[evento.id] += 2;
  bus.emit("sincro_inf_compr"+estado_sincro_inf_compr[evento.id], evento);
})

bus.on("momResultadoAutorizacion", function (evento) {

  mediador.incrementar();
  console.log("ENT: compra " + evento.id + " pago --> " + evento.compra.pago);

  // si el pago fue rechazado
  if(evento.compra.pago === evento.compra.pago_valores[2]){

    evento.tarea = "informarPagoRechazado";
    bus.emit(evento.tarea, evento);
  }

  // si el pago fue autorizado
  if(evento.compra.pago === evento.compra.pago_valores[1]){

    evento.compra.estado = evento.compra.estados[3]; // aceptada

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
... sincronizacion
.............................................................
*/

bus.on("sincro_inf_compr1", function (evento) {
});

bus.on("sincro_inf_compr2", function (evento) {
});

bus.on("sincro_inf_compr3", function (evento) {

  mediador.incrementar();
  evento.compra.infracciones = estado_inf;
  estado_inf = null;

  // si la compra no registra infracciones
  if(evento.compra.infracciones === evento.compra.infracciones_valores[1]){

    evento.tarea = "autorizarPago";
    bus.emit(evento.tarea, evento);
  }

  // si la compra registra infracciones
  if(evento.compra.infracciones === evento.compra.infracciones_valores[2]){

    evento.compra.estado = evento.compra.estados[2];  // cancelada
    evento.tarea = "informarInfraccion";
    bus.emit(evento.tarea, evento);
  }
});
