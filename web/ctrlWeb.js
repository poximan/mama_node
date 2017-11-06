require("../mom/momSuscriptor").suscribir("cola_web");

var bus = require('../eventBus');

/*
param 1 = indice del que es responsable en reloj vectorial
param 2 = coleccion en donde persiten sus documentos este servidor
param 3 = cantidad de respuetas que espera para fin corte consistente
*/
var mediador = require("../mom/momMediador")(0, "colecc_web", 1);

var async = require('async');

// ---------

exports.mediador = mediador;
exports.bus = bus;

// ---------

var id = 1;
var publicaciones = [];

exports.comprar = function() {

  if(publicaciones.length > 0){

    var operaciones = [
      function(callback) {  // el callback siempre es el ultimo parametro
          var nueva_compra = JSON.parse(require('fs').readFileSync('./payload.json', 'utf8'));
          callback(null, nueva_compra);
      },
      function(nueva_compra, callback) {  // el callback siempre es el ultimo parametro
          nueva_compra.publicacion = publicaciones[indicePublicacionElegida()];
          callback(null, nueva_compra);
      },
      function(nueva_compra, callback) {
          nueva_compra.tarea = "momNuevaCompra";
          callback(null, nueva_compra);
      }
    ];
    async.waterfall(operaciones, function (err, nueva_compra) {

      mediador.incrementar();

      nueva_compra.id = id++;
      bus.emit(nueva_compra.tarea, nueva_compra);
    });
  }
}

function indicePublicacionElegida() {
  return Math.floor(Math.random() * (publicaciones.length - 1));
}

/*
.............................................................
... mensajes entrantes
.............................................................
*/

bus.on("momPublicacionSeleccionada", function (evento) {

  mediador.incrementar();
  console.log("ENT: compra " + evento.id + " --> " + "preguntando forma de entrega");

  evento.tarea = "resultadoFormaEntrega";
  bus.emit(evento.tarea, evento);
});

bus.on("momSeleccionarMedioPago", function (evento) {

  mediador.incrementar();
  console.log("ENT: compra " + evento.id + " --> " + "preguntando medio de pago");

  evento.tarea = "resultadoMedioPago";
  bus.emit(evento.tarea, evento);
});

bus.on("momConfirmarCompra", function (evento) {

  mediador.incrementar();
  console.log("ENT: compra " + evento.id + " --> " + "preguntando a cliente si confima");

  evento.tarea = "resultadoConfirmar";
  bus.emit(evento.tarea, evento);
});

bus.on("momInformarInfraccion", function (evento) {

  evento = mediador.actualizarAtributo(evento);

  mediador.incrementar();
  console.log("ENT: compra " + evento.id + " --> cancelada " + evento.compra.infracciones);
});

bus.on("momInformarPagoRechazado", function (evento) {

  evento = mediador.actualizarAtributo(evento);

  mediador.incrementar();
  console.log("ENT: compra " + evento.id + " --> " + evento.compra.pago + " por pago");
});

bus.on("momAceptarCompra", function (evento) {

  evento = mediador.actualizarAtributo(evento);

  mediador.incrementar();
  console.log("ENT: compra " + evento.id + " --> " + evento.compra.estado + " en sistema");
  console.log("¡MUCHAS GRACIAS POR COMPRAR!... cerdo capitalista");
});

bus.on("momResultadoPublicaciones", function (evento) {

  console.log("ENT: obteniendo " + evento.publicaciones.length + " nuevas publicaciones");
  publicaciones = evento.publicaciones;
});

/*
.............................................................
... mensajes salientes
.............................................................
*/

bus.on("momGetPublicaciones", function (evento) {

  console.log("SAL: solicitando publicaciones");

  evento.tarea = "momGetPublicaciones";
  mediador.publicar("publicaciones", evento);
});

bus.on("momNuevaCompra", function (evento) {

  mediador.incrementar();
  console.log("SAL: nueva compra " + evento.id + " --> " + evento.publicacion.descripcion);

  evento.tarea = "momPublicacionSeleccionada";
  mediador.publicar("compras.infracciones.publicaciones", evento);
});

bus.on("momResultadoFormaEntrega", function (evento) {

  mediador.incrementar();
  evento = mediador.actualizarAtributo(evento);

  console.log("SAL: compra " + evento.id + " --> " + evento.compra.entrega);
  mediador.publicar("compras", evento);
});

bus.on("momResultadoMedioPago", function (evento) {

  mediador.incrementar();
  evento = mediador.actualizarAtributo(evento);

  console.log("SAL: compra " + evento.id + " --> " + evento.compra.medio);
  mediador.publicar("compras", evento);
});

bus.on("momResultadoConfirmar", function (evento) {

  mediador.incrementar();
  evento = mediador.actualizarAtributo(evento);

  console.log("SAL: compra " + evento.id + " --> " + evento.compra.estado + " por cliente");
  mediador.publicar("compras", evento);
});

/*
.............................................................
... mensajes internos
.............................................................
*/

exports.hayPublicaciones = function() {
  return publicaciones.length > 0;
}
