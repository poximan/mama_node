var amqp = require('amqplib/callback_api');
var publicador = require("../mod_pub");
var bus = require('../eventBus');

var value = 0,    // valor inicial
    size  = 1000, // tamaño del arreglo
    estado_sincro_inf_compr = Array.apply(null,{length: size}).map(function() { return value; });

/*
la concurrencia del sistema impide saber que mensaje llegara primero.
para evitar la posible perdida de la respuesta desde el servidor de infracciones
se salva el valor aqui, para luego ser recuperado en el punto de sincronizacion
*/
var estado_inf = null;

/*
.............................................................
... mensajes a MOM
.............................................................
*/

bus.on("nuevaCompra", function (evento) {

  evento.data.compra.estado = evento.data.compra.estados[0]; // generada

  console.log("\ndelegando calculos de compra " + evento.id + " ");
  evento.tarea = "publicacionSeleccionada";
  publicador("web.infracciones.publicaciones", evento)
});

bus.on("calcularCosto", function (evento) {
  publicador("envios", evento)
})

bus.on("seleccionarMedioPago", function (evento) {
  publicador("web", evento)
})

bus.on("confirmarCompra", function (evento) {
  publicador("web", evento)
})

bus.on("informarInfraccion", function (evento) {

  console.log("compra " + evento.id + " cancelada por infraccion");
  publicador("web", evento)
})

bus.on("informarPagoRechazado", function (evento) {

  console.log("compra " + evento.id + " cancelada por pago rechazado");
  publicador("web", evento)
})

bus.on("autorizarPago", function (evento) {

  console.log("verficando pago en compra " + evento.id);
  publicador("pagos", evento)
})

bus.on("terminarCompra", function (evento) {

  console.log("compra " + evento.id + " terminada. ¡final feliz!");
  publicador("web", evento)
})

bus.on("agendarEnvio", function (evento) {
  publicador("envios", evento)
})

/*
.............................................................
... mensajes internos
.............................................................
*/

bus.on("pagoAutorizado", function (evento) {

  evento.tarea = "terminarCompra";
  bus.emit(evento.tarea, evento);

  // si el cliente elige metodo de envio correo
  if(evento.data.compra.entrega.estado === evento.data.compra.entrega.estados[2]){

    evento.tarea = "agendarEnvio";
    bus.emit(evento.tarea, evento);
  }
})

bus.on("resultadoAutorizacion", function (evento) {
  console.log("resultado autorizacion de pago en compra " + evento.id + " --> " + evento.data.compra.pago.estado);

  // si el pago fue rechazado
  if(evento.data.compra.pago.estado === evento.data.compra.pago.estado[2]){

    evento.tarea = "informarPagoRechazado";
    bus.emit(evento.tarea, evento);
  }

  // si el pago fue aceptado
  if(evento.data.compra.entrega.estado === evento.data.compra.entrega.estados[1]){

    evento.tarea = "pagoAutorizado";
    bus.emit(evento.tarea, evento);
  }
})

bus.on("resultadoEnvio", function (evento) {
  console.log("resultado envio compra " + evento.id + " --> " + evento.data.compra.entrega.estado);

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

bus.on("resultadoMedioPago", function (evento) {
  console.log("resultado medio de pago de la compra " + evento.id + " --> " + evento.data.compra.pago.medio);

  evento.tarea = "confirmarCompra";
  bus.emit(evento.tarea, evento);
})

bus.on("resultadoCosto", function (evento) {

  console.log("resultado costo adicional por envio de compra " + evento.id + " --> " + evento.data.compra.adic_envio.valor);

  evento.tarea = "seleccionarMedioPago";
  bus.emit(evento.tarea, evento);
});

bus.on("resultadoConfirmar", function (evento) {

  console.log("resultado de confirmacion compra " + evento.id + " --> " + evento.data.compra.estado);

  estado_sincro_inf_compr[evento.id] += 1;
  bus.emit("sincro_inf_compr"+estado_sincro_inf_compr[evento.id], evento);
});

bus.on("resultadoInfraccion", function (evento) {
  console.log("resultado infraccion compra " + evento.id + " --> " + evento.data.publicacion.infracciones.estado);

  estado_inf = evento.data.publicacion.infracciones.estado;

  estado_sincro_inf_compr[evento.id] += 2;
  bus.emit("sincro_inf_compr"+estado_sincro_inf_compr[evento.id], evento);
})


/*
.............................................................
... sincronizacion
.............................................................
*/

bus.on("sincro_inf_compr1", function (evento) {
  console.log("esperando resultado infraccion");
});

bus.on("sincro_inf_compr2", function (evento) {

  console.log("se obtuvo resultado infraccion");
  console.log("esperando confirmacion compra");
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
