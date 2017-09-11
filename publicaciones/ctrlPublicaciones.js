var amqp = require('amqplib/callback_api');
var publicador = require("../mod_pub");
var bus = require('../eventBus');
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

  var msg = []

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
      evento.data = msg;
      callback(null);
    },
    function(callback) {
      publicador("web", evento);
      callback(null);
    }
  ];

  async.waterfall(operaciones, function (err, evento) {
    console.log("SAL: enviando publicacione existentes");
  });
});

/*
.............................................................
... mensajes entrante
.............................................................
*/

bus.on("momPublicacionSeleccionada", function (evento) {
  console.log("ENT: compra " + evento.id + " --> " + "producto reservado");
  reservas.push(evento);

  estado_sincro_inf_pub[evento.id] += 1;
  bus.emit("sincro_inf_pub"+estado_sincro_inf_pub[evento.id], evento);
});

bus.on("momResultadoInfraccion", function (evento) {

  estado_inf = evento.data.publicacion.infracciones.estado;

  estado_sincro_inf_pub[evento.id] += 2;
  bus.emit("sincro_inf_pub"+estado_sincro_inf_pub[evento.id], evento);
})

bus.on("momResultadoAutorizacion", function (evento) {

  estado_pago = evento.data.compra.pago.estado;

  estado_sincro_pub_pag[evento.id] += 2;
  bus.emit("sincro_pub_pag"+estado_sincro_pub_pag[evento.id], evento);
})

bus.on("momResultadoAgendarEnvio", function (evento) {

  estado_envio = evento.data.compra.destino.valor;

  estado_sincro_pub_env[evento.id] += 2;
  bus.emit("sincro_pub_env"+estado_sincro_pub_env[evento.id], evento);
})

/*
.............................................................
... mensajes internos
.............................................................
*/

bus.on("liberarProducto", function (evento) {

  console.log("INTERNO: compra " + evento.id + " --> " + "liberada");

  for (var i = 0; i < reservas.length; i++){
    if (reservas[i].id === evento.id) {
      reservas.splice(i, 1);
      break;
    }
  }
});

bus.on("enviarProducto", function (evento) {
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

  evento.data.publicacion.infracciones.estado = estado_inf;
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

  console.log("INTERNO: compra " + evento.id + " --> " + "sincro 2 terminada");
  evento.data.compra.pago.estado = estado_pago;
  estado_inf = null;

  // si la compra registra infracciones o el pago fue rechazado
  if(evento.data.publicacion.infracciones.estado === evento.data.publicacion.infracciones.estados[1] ||
    evento.data.compra.pago.estado === evento.data.compra.pago.estados[2]){

    evento.tarea = "liberarProducto";
    bus.emit(evento.tarea, evento);
  }

  // si la compra no registra infracciones y el pago fue aceptado
  if(evento.data.publicacion.infracciones.estado === evento.data.publicacion.infracciones.estados[2] ||
    evento.data.compra.pago.estado === evento.data.compra.pago.estados[1]){

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

  console.log("INTERNO: compra " + evento.id + " --> " + "sincro 3 terminada");

  evento.data.compra.destino = estado_envio;
  estado_envio = null;

  evento.tarea = "enviarProducto";
  bus.emit(evento.tarea, evento);
});
