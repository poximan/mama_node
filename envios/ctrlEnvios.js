require("../mom/momSuscriptor").suscribir("cola_envios");

var bus = require('../eventBus');

/*
param 1 = indice del que es responsable en reloj vectorial
param 2 = coleccion en donde persiten sus documentos este servidor
param 3 = cantidad de respuetas que espera para fin corte consistente
*/
var mediador = require("../mom/momMediador")(4, "colecc_envios", 1);


// ---------

exports.mediador = mediador;
exports.bus = bus;

/*
.............................................................
... mensajes entrantes
.............................................................
*/

bus.on("momCalcularCosto", function (evento) {

  mediador.incrementar();

  console.log("ENT: compra " + evento.id + " --> " + "preguntando costo adicional por correo");
  evento.tarea = "resultadoCosto";
  bus.emit(evento.tarea, evento);
});

/*
.............................................................
... mensajes salientes
.............................................................
*/

bus.on("momResultadoCosto", function (evento) {

  mediador.incrementar();

  console.log("SAL: compra " + evento.id + " adic correo --> " + evento.compra.adic_envio);
  evento = mediador.actualizarAtributo(evento);

  mediador.publicar("compras", evento);
});

bus.on("momAgendarEnvio", function (evento) {

  mediador.incrementar();

  console.log("SAL: compra " + evento.id + " --> agendada");
  evento = mediador.actualizarAtributo(evento);

  evento.tarea = "momResultadoAgendarEnvio";
  mediador.publicar("publicaciones", evento);
});

/*
.............................................................
... mensajes internos
.............................................................
*/
