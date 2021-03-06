var bus = require("mom-bus-comunic");

/*
param 1 = indice del reloj vectorial que debe incrementar este servidor
param 2 = coleccion mongo donde persite este servidor
param 3 = nombre de la cola MOM que escucha este servidor
param 4 = instancia de bus para gestion de eventos
param 5 = lista de suscriptores del servidor dado
param 6 = cantidad de confirmaciones externas para fin corte consistente
*/
var nucleo = require("../ctrlNucleo")(4, "colecc_envios", "cola_envios", bus, "compras.publicaciones", 1);
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
