require("../mom/momSuscriptor").suscribir("cola_web");

var bus = require('../eventBus');
var mediador = require("../mom/momMediador");

var async = require('async');

// ---------

mediador.coleccion("colecc_web");
mediador.indice(0);
mediador.registroCompras(new Array());
mediador.respuestasCorte(1);
mediador.registroCorte(new Array());

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

  mediador.incrementar();
  console.log("ENT: compra " + evento.id + " --> cancelada " + evento.compra.infracciones);
});

bus.on("momInformarPagoRechazado", function (evento) {

  mediador.incrementar();
  console.log("ENT: compra " + evento.id + " --> " + evento.compra.pago + " por pago");
});

bus.on("momAceptarCompra", function (evento) {

  mediador.incrementar();
  console.log("ENT: compra " + evento.id + " --> " + evento.compra.estado + " en sistema");
});

bus.on("momResultadoPublicaciones", function (evento) {

  console.log("INTERNO: obteniendo nuevas publicaciones");

  evento.tarea = "cargarPublicaciones";
  bus.emit(evento.tarea, evento);
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

bus.on("cargarPublicaciones", function (evento) {
  publicaciones = evento.publicaciones;
});
