var bus = require("mom-bus-comunic");

/*
param 1 = indice del reloj vectorial que debe incrementar este servidor
param 2 = coleccion mongo donde persite este servidor
param 3 = nombre de la cola MOM que escucha este servidor
param 4 = instancia de bus para gestion de eventos
param 5 = lista de suscriptores del servidor dado
param 6 = cantidad de confirmaciones externas para fin corte consistente
*/
var nucleo = require("../ctrlNucleo")(0, "colecc_web", "cola_web", bus, "compras", 1);
var mw = nucleo.mw;

// ---------

exports.nucleo = nucleo;
exports.bus = bus;

// ---------

var async = require('async');
var id = 0;
var publicaciones = [];

// ---------

exports.comprar = function() {

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
        nueva_compra.tarea = "nuevaCompra";
        callback(null, nueva_compra);
    }
  ];
  async.waterfall(operaciones, function (err, nueva_compra) {

    mw.incrementar();

    if(id < nucleo.id_mayor)
      id = nucleo.id_mayor;

    nueva_compra.id = id++;
    bus.emit(nueva_compra.tarea, nueva_compra);
  });
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

  mw.incrementar();
  console.log("ENT: compra " + evento.id + " --> " + "preguntando forma de entrega");

  evento = nucleo.actualizarAtributo(evento);

  evento.tarea = "resultadoFormaEntrega";
  bus.emit(evento.tarea, evento);
});

bus.on("momSeleccionarMedioPago", function (evento) {

  mw.incrementar();
  console.log("ENT: compra " + evento.id + " --> " + "preguntando medio de pago");

  evento = nucleo.actualizarAtributo(evento);

  evento.tarea = "resultadoMedioPago";
  bus.emit(evento.tarea, evento);
});

bus.on("momConfirmarCompra", function (evento) {

  mw.incrementar();
  console.log("ENT: compra " + evento.id + " --> " + "preguntando a cliente si confima");

  evento = nucleo.actualizarAtributo(evento);

  evento.tarea = "resultadoConfirmar";
  bus.emit(evento.tarea, evento);
});

bus.on("momInformarInfraccion", function (evento) {

  mw.incrementar();
  console.log("ENT: compra " + evento.id + " --> cancelada " + evento.compra.infracciones);

  evento = nucleo.actualizarAtributo(evento);
});

bus.on("momInformarPagoRechazado", function (evento) {

  evento = nucleo.actualizarAtributo(evento);

  mw.incrementar();
  console.log("ENT: compra " + evento.id + " --> " + evento.compra.pago + " por pago");
});

bus.on("momAceptarCompra", function (evento) {

  evento = nucleo.actualizarAtributo(evento);

  mw.incrementar();
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
  mw.publicar("publicaciones", evento);
});

bus.on("nuevaCompra", function (evento) {

  mw.incrementar();
  console.log("SAL: nueva compra " + evento.id + " --> " + evento.publicacion.descripcion);

  evento.tarea = "momPublicacionSeleccionada";
  mw.publicar("compras.infracciones.publicaciones", evento);

  nucleo.agregarCompra(evento);
});

bus.on("momResultadoFormaEntrega", function (evento) {

  mw.incrementar();
  evento = nucleo.actualizarAtributo(evento);

  console.log("SAL: compra " + evento.id + " --> " + evento.compra.entrega);
  mw.publicar("compras", evento);
});

bus.on("momResultadoMedioPago", function (evento) {

  mw.incrementar();
  evento = nucleo.actualizarAtributo(evento);

  console.log("SAL: compra " + evento.id + " --> " + evento.compra.medio);
  mw.publicar("compras", evento);
});

bus.on("momResultadoConfirmar", function (evento) {

  mw.incrementar();
  evento = nucleo.actualizarAtributo(evento);

  console.log("SAL: compra " + evento.id + " --> " + evento.compra.estado + " por cliente");
  mw.publicar("compras", evento);
});

/*
.............................................................
... mensajes internos
.............................................................
*/

exports.hayPublicaciones = function() {
  return publicaciones.length > 0;
}
