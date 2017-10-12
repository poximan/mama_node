var suscriptor = require("../mom/momSuscriptor");
suscriptor.suscribir("cola_web");
var publicador = require("../mom/momPublicador");

var bus = require('../eventBus');
var mediador = require("../mom/momMediador");

var async = require('async');

// ---------

mediador.coleccion("colecc_web");
mediador.indice(5);

exports.mediador = mediador;
exports.bus = bus;

// ---------

var id = 1;
var publicaciones = [];

exports.comprar = function() {

  if(publicaciones.length > 0){

    var operaciones = [
      function(callback) {  // el callback siempre es el ultimo parametro
          var evento = JSON.parse(require('fs').readFileSync('./payload.json', 'utf8'));
          callback(null, evento);
      },
      function(evento, callback) {  // el callback siempre es el ultimo parametro
          evento.data.publicacion = publicaciones[indicePublicacionElegida()];
          callback(null, evento);
      },
      function(evento, callback) {
          evento.tarea = "nuevaCompra";
          callback(null, evento);
      }
    ];
    async.waterfall(operaciones, function (err, evento) {
      evento.id = id++;
      bus.emit(evento.tarea, evento);
    });
  }
}

function indicePublicacionElegida() {
  return Math.floor(Math.random() * publicaciones.length);
}

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

  console.log("ENT: compra " + evento.id + " --> " + "preguntando forma de entrega");
  evento.tarea = "resultadoFormaEntrega";
  bus.emit(evento.tarea, evento);
});

bus.on("momSeleccionarMedioPago", function (evento) {

  console.log("ENT: compra " + evento.id + " --> " + "preguntando medio de pago");
  evento.tarea = "resultadoMedioPago";
  bus.emit(evento.tarea, evento);
});

bus.on("momConfirmarCompra", function (evento) {

  console.log("ENT: compra " + evento.id + " --> " + "preguntando a cliente si confima");
  evento.tarea = "resultadoConfirmar";
  bus.emit(evento.tarea, evento);
});

bus.on("momInformarInfraccion", function (evento) {
  console.log("ENT: compra " + evento.id + " --> " + evento.data.compra.estado + " por infraccion");
});

bus.on("momInformarPagoRechazado", function (evento) {
  console.log("ENT: compra " + evento.id + " --> " + evento.data.compra.pago.estado + " por pago");
});

bus.on("momAceptarCompra", function (evento) {
  console.log("ENT: compra " + evento.id + " --> " + evento.data.compra.estado + " en sistema");
});

/*
.............................................................
... mensajes salientes
.............................................................
*/

bus.on("momGetPublicaciones", function (evento) {

  console.log("SAL: solicitando publicaciones");

  evento.tarea = "momGetPublicaciones";
  publicador("publicaciones", evento)
});

bus.on("nuevaCompra", function (evento) {
  evento.tarea = "momNuevaCompra";
  publicador("compras", evento);
});

bus.on("momResultadoFormaEntrega", function (evento) {

  console.log("SAL: compra " + evento.id + " --> " + evento.data.compra.entrega.estado);
  publicador("compras", evento);
});

bus.on("momResultadoMedioPago", function (evento) {

  console.log("SAL: compra " + evento.id + " --> " + evento.data.compra.pago.medio);
  publicador("compras", evento);
});

bus.on("momResultadoConfirmar", function (evento) {

  console.log("SAL: compra " + evento.id + " --> " + evento.data.compra.estado + " por cliente");
  publicador("compras", evento);
});

/*
.............................................................
... mensajes internos
.............................................................
*/

bus.on("cargarPublicaciones", function (evento) {
  publicaciones = evento.data;
});

bus.on("momResultadoPublicaciones", function (evento) {

  console.log("INTERNO: obteniendo nuevas publicaciones");

  evento.tarea = "cargarPublicaciones";
  bus.emit(evento.tarea, evento);
});
