var amqp = require('amqplib/callback_api');
var publicador = require("../mod_pub");
var bus = require('../eventBus');

/*
.............................................................
... mensajes MOM entrada-salida
.............................................................
*/

bus.on("momPublicacionSeleccionada", function (evento) {

  evento.tarea = "resultadoInfraccion";
  bus.emit(evento.tarea, evento);

  console.log("SAL: compra " + evento.id + " --> " + evento.data.publicacion.infracciones.estado);

  evento.tarea = "momResultadoInfraccion";
  publicador("compras.publicaciones", evento);
});

/*
.............................................................
... mensajes internos
.............................................................
*/
