var publicador = require("../mom/momPublicador");
var bus = require('../eventBus');

/*
.............................................................
... mensajes MOM entrada-salida
.............................................................
*/


/*
.............................................................
... mensajes entrantes
.............................................................
*/

bus.on("momPublicacionSeleccionada", function (evento) {

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

  console.log("SAL: compra " + evento.id + " --> " + evento.data.publicacion.infracciones.estado);
  publicador("compras.publicaciones", evento);
});

/*
.............................................................
... mensajes internos
.............................................................
*/
