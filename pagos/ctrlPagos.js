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

bus.on("momAutorizarPago", function (evento) {

  evento.tarea = "resultadoAutorizacion";
  bus.emit(evento.tarea, evento);
});

/*
.............................................................
... mensajes salientes
.............................................................
*/

bus.on("momResultadoAutorizacion", function (evento) {

  console.log("SAL: compra " + evento.id + " --> " + evento.data.compra.pago.estado);
  publicador("compras.publicaciones", evento);
});

/*
.............................................................
... mensajes internos
.............................................................
*/
