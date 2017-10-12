var suscriptor = require("../mom/momSuscriptor");
suscriptor.suscribir("cola_infracciones");
var publicador = require("../mom/momPublicador");

var bus = require('../eventBus');
var mediador = require("../mom/momMediador");

// ---------

mediador.coleccion("colecc_infracciones");
mediador.indice(2);

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
  console.log("SAL: compra " + evento.id + " --> " + evento.data.publicacion.infracciones.estado);
  publicador("compras.publicaciones", evento);
});

/*
.............................................................
... mensajes internos
.............................................................
*/
