var bus = require("mom-bus-comunic");

/*
param 1 = indice del reloj vectorial que debe incrementar este servidor
param 2 = coleccion mongo donde persite este servidor
param 3 = nombre de la cola MOM que escucha este servidor
param 4 = instancia de bus para gestion de eventos
param 5 = lista de suscriptores del servidor dado
param 6 = cantidad de confirmaciones externas para fin corte consistente
*/
var nucleo = require("../ctrlNucleo")(3, "colecc_infracciones", "cola_infracciones", bus, "compras.publicaciones", 1);
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
