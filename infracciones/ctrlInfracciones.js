require("../mom/momSuscriptor").suscribir("cola_infracciones");

var bus = require('../eventBus');
var mediador = require("../mom/momMediador");

// ---------

mediador.coleccion("colecc_infracciones");
mediador.indice(3);

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
