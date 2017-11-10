var bus = require('../eventBus');

/*
param 1 = indice del reloj vectorial que debe incrementar este servidor
param 2 = coleccion mongo donde persite este servidor
param 3 = cantidad de respuetas que espera para fin corte consistente
param 4 = nombre de la cola MOM que escucha este servidor
param 5 = instancia de bus para gestion de eventos
*/
var nucleo = require("../ctrlNucleo")(3, "colecc_infracciones", 1, "cola_infracciones", bus);
var mw = nucleo.mw;

// ---------

exports.nucleo = nucleo;
exports.bus = bus;

/*
.............................................................
... mensajes entrantes
.............................................................
*/

bus.on("momPublicacionSeleccionada", function (evento) {

  mw.incrementar();

  console.log("ENT: compra " + evento.id + " --> " + "preguntando si hubo infraccion");
  evento.tarea = "resultadoInfraccion";
  bus.emit(evento.tarea, evento);
});

/*
.............................................................
... mensajes salientes
.............................................................
*/

bus.on("momResultadoInfraccion", function (evento) {

  mw.incrementar();

  console.log("SAL: compra " + evento.id + " --> " + evento.compra.infracciones);
  evento = nucleo.actualizarAtributo(evento);
  mw.publicar("compras.publicaciones", evento);
});

/*
.............................................................
... mensajes internos
.............................................................
*/
