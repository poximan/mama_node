require("../mom/momSuscriptor").suscribir("cola_infracciones");

var bus = require('../eventBus');

/*
param 1 = indice del que es responsable en reloj vectorial
param 2 = coleccion en donde persiten sus documentos este servidor
param 3 = cantidad de respuetas que espera para fin corte consistente
*/
var mediador = require("../mom/momMediador")(3, "colecc_infracciones", 1);

// ---------

exports.mediador = mediador;
exports.bus = bus;

/*
.............................................................
... mensajes entrantes
.............................................................
*/

bus.on("momPublicacionSeleccionada", function (evento) {

  mediador.incrementar();

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

  mediador.incrementar();

  console.log("SAL: compra " + evento.id + " --> " + evento.compra.infracciones);
  mediador.publicar("compras.publicaciones", evento);
});

/*
.............................................................
... mensajes internos
.............................................................
*/
