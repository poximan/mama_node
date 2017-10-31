require("../mom/momSuscriptor").suscribir("cola_publicaciones");

var bus = require('../eventBus');
var mediador = require("../mom/momMediador");

// ---------

mediador.coleccion("colecc_publicaciones");
mediador.indice(1);
mediador.registroCompras(new Array);

exports.mediador = mediador;
exports.bus = bus;

// ---------

var fs = require('fs');
var async = require('async');

var reservas = [];

var value = 0,      // valor inicial
    size  = 10000,  // tamaño del arreglo
    estado_sincro_inf_pub = Array.apply(null,{length: size}).map(function() { return value; });

var value = 0,      // valor inicial
    size  = 10000,  // tamaño del arreglo
    estado_sincro_pub_pag = Array.apply(null,{length: size}).map(function() { return value; });

var value = 0,      // valor inicial
    size  = 10000,  // tamaño del arreglo
    estado_sincro_pub_env = Array.apply(null,{length: size}).map(function() { return value; });

/*
la concurrencia del sistema impide saber que mensaje llegara primero.
para evitar la posible perdida de la respuesta desde el servidor de infracciones
se salva el valor aqui, para luego ser recuperado en el punto de sincronizacion
*/
var estado_inf = null;
var estado_pago = null;
var estado_envio = null;

/*
.............................................................
... mensajes MOM entrada-salida
.............................................................
*/

bus.on("momGetPublicaciones", function (evento) {

  var msg = [];

  var operaciones = [
    function(callback) {  // el callback siempre es el ultimo parametro

      var publicaciones = JSON.parse(require('fs').readFileSync('./publicaciones.json', 'utf8'));
      callback(null, publicaciones);
    },
    function(publicaciones, callback) {  // el callback siempre es el ultimo parametro

      for(var i = 0; i < publicaciones.length; i++){

        bus.emit("resultadoStock", publicaciones[i]);
        msg.push(publicaciones[i]);
      }
      callback(null);
    },
    function(callback) {

      evento.tarea = "momResultadoPublicaciones";
      evento.publicaciones = msg;
      callback(null);
    },
    function(callback) {

      mediador.publicar("web", evento);
      callback(null);
    }
  ];

  async.waterfall(operaciones, function (err, evento) {
    console.log("SAL: enviando publicacione existentes");
  });
});

/*
.............................................................
... mensajes entrantes
.............................................................
*/

bus.on("momPublicacionSeleccionada", function (evento) {

  mediador.incrementar();
  console.log("ENT: compra " + evento.id + " --> " + "producto reservado");
  reservas.push(evento);

  estado_sincro_inf_pub[evento.id] += 1;
  bus.emit("sincro_inf_pub"+estado_sincro_inf_pub[evento.id], evento);
});

bus.on("momResultadoInfraccion", function (evento) {

  mediador.incrementar();
  console.log("ENT: compra " + evento.id + " --> " + evento.compra.infracciones);

  evento = mediador.actualizarAtributo(evento);

  estado_sincro_inf_pub[evento.id] += 2;
  bus.emit("sincro_inf_pub"+estado_sincro_inf_pub[evento.id], evento);
})

bus.on("momResultadoAutorizacion", function (evento) {

  mediador.incrementar();
  console.log("ENT: compra " + evento.id + " pago --> " + evento.compra.pago);

  evento = mediador.actualizarAtributo(evento);

  estado_sincro_pub_pag[evento.id] += 2;
  bus.emit("sincro_pub_pag"+estado_sincro_pub_pag[evento.id], evento);
})

bus.on("momResultadoAgendarEnvio", function (evento) {

  mediador.incrementar();
  console.log("ENT: compra " + evento.id + " --> " + "destino agendado");

  evento = mediador.actualizarAtributo(evento);

  estado_sincro_pub_env[evento.id] += 2;
  bus.emit("sincro_pub_env"+estado_sincro_pub_env[evento.id], evento);
})

/*
.............................................................
... mensajes internos
.............................................................
*/

bus.on("liberarProducto", function (evento) {

  mediador.incrementar();
  console.log("INTERNO: compra " + evento.id + " --> " + "liberada");

  for (var i = 0; i < reservas.length; i++){
    if (reservas[i].id === evento.id) {
      reservas.splice(i, 1);
      break;
    }
  }
});

bus.on("enviarProducto", function (evento) {

  mediador.incrementar();
  console.log("INTERNO: producto " + evento.id + " --> " + "enviado");
});

/*
.............................................................
... sincronizacion 1
.............................................................
*/

bus.on("sincro_inf_pub1", function (evento) {
});

bus.on("sincro_inf_pub2", function (evento) {
});

bus.on("sincro_inf_pub3", function (evento) {

  mediador.incrementar();
  evento.compra.infracciones = estado_inf;
  estado_inf = null;

  console.log("INTERNO: compra " + evento.id + " --> " + "sincro 1 terminada");

  estado_sincro_pub_pag[evento.id] += 1;
  bus.emit("sincro_pub_pag"+estado_sincro_pub_pag[evento.id], evento);
});

/*
.............................................................
... sincronizacion 2
.............................................................
*/

bus.on("sincro_pub_pag1", function (evento) {
});

bus.on("sincro_pub_pag2", function (evento) {
});

bus.on("sincro_pub_pag3", function (evento) {

  mediador.incrementar();
  console.log("INTERNO: compra " + evento.id + " --> " + "sincro 2 terminada");
  evento.compra.pago = estado_pago;
  estado_inf = null;

  // si la compra registra infracciones o el pago fue rechazado
  if(evento.compra.infracciones === evento.compra.infracciones_valores[2] ||
    evento.compra.pago === evento.compra.pago_valores[2]){

    evento.tarea = "liberarProducto";
    bus.emit(evento.tarea, evento);
  }

  // si la compra no registra infracciones y el pago fue aceptado
  if(evento.compra.infracciones === evento.compra.infracciones_valores[1] ||
    evento.compra.pago === evento.compra.pago_valores[1]){

      estado_sincro_pub_env[evento.id] += 1;
      bus.emit("sincro_pub_env"+estado_sincro_pub_env[evento.id], evento);
  }
});

/*
.............................................................
... sincronizacion 3
.............................................................
*/

bus.on("sincro_pub_env1", function (evento) {
});

bus.on("sincro_pub_env2", function (evento) {
});

bus.on("sincro_pub_env3", function (evento) {

  mediador.incrementar();
  console.log("INTERNO: compra " + evento.id + " --> " + "sincro 3 terminada");

  evento.compra.destino = estado_envio;
  estado_envio = null;

  evento.tarea = "enviarProducto";
  bus.emit(evento.tarea, evento);
});
