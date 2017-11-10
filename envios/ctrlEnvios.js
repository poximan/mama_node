var bus = require('../eventBus');

/*
param 1 = indice del reloj vectorial que debe incrementar este servidor
param 2 = coleccion mongo donde persite este servidor
param 3 = cantidad de respuetas que espera para fin corte consistente
param 4 = nombre de la cola MOM que escucha este servidor
param 5 = instancia de bus para gestion de eventos
*/
var nucleo = require("../ctrlNucleo")(4, "colecc_envios", 1, "cola_envios", bus);
var mw = nucleo.mw;

// ---------

exports.nucleo = nucleo;
exports.bus = bus;

/*
.............................................................
... mensajes entrantes
.............................................................
*/

bus.on("momCalcularCosto", function (evento) {

  mw.incrementar();

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

  mw.incrementar();

  console.log("SAL: compra " + evento.id + " adic correo --> " + evento.compra.adic_envio);
  evento = nucleo.actualizarAtributo(evento);
  mw.publicar("compras", evento);
});

bus.on("momAgendarEnvio", function (evento) {

  mw.incrementar();

  console.log("SAL: compra " + evento.id + " --> agendada");
  evento = nucleo.actualizarAtributo(evento);

  evento.tarea = "momResultadoAgendarEnvio";
  mw.publicar("publicaciones", evento);
});

/*
.............................................................
... mensajes internos
.............................................................
*/
