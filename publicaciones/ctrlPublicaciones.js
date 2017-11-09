var bus = require('../eventBus');

/*
param 1 = indice del reloj vectorial que debe incrementar este servidor
param 2 = coleccion mongo donde persite este servidor
param 3 = cantidad de respuetas que espera para fin corte consistente
param 4 = nombre de la cola MOM que escucha este servidor
param 5 = instancia de bus para gestion de eventos
*/
var nucleo = require("../ctrlNucleo")(1, "colecc_publicaciones", 4, "cola_publicaciones", bus);
var mw = nucleo.mw;

// ---------

exports.nucleo = nucleo;
exports.bus = bus;

// ---------

var fs = require('fs');
var async = require('async');

var reservas = [];

/*
.............................................................
... sincronizacion 1
se espera la llegada de dos mensajes
1) desde servidor infracciones - compra sin infracciones
2) desde servidores publicaciones - producto reservado
.............................................................
*/
var estado_sincro_inf_pub = [];

/*
.............................................................
... sincronizacion 2
se espera la llegada de dos mensajes
1) desde servidor pagos - el pago fue aceptado
2) desde servidores inf/pub - sin infracciones y producto reservado
.............................................................
*/
var estado_sincro_pub_pag = [];

/*
.............................................................
... sincronizacion 3
se espera la llegada de dos mensajes
1) desde servidor pagos - el pago fue aceptado
2) desde servidor envios - el envio fue agendado
.............................................................
*/
var estado_sincro_pub_env = [];

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

      mw.publicar("web", evento);
      callback(null);
    }
  ];

  async.waterfall(operaciones, function (err, evento) {
    console.log("SAL: enviando publicaciones existentes");
  });
});

/*
.............................................................
... mensajes entrantes
.............................................................
*/

bus.on("momPublicacionSeleccionada", function (evento) {

  mw.incrementar();
  console.log("ENT: compra " + evento.id + " --> " + "producto reservado");

  reservas.push(evento);
  evento.compra.reserva = evento.compra.reserva_valores[1]; // reservado
  evento = nucleo.actualizarAtributo(evento);

  nucleo.sumar(estado_sincro_inf_pub, evento.id, 1);
  bus.emit("sincro_inf_pub"+estado_sincro_inf_pub[evento.id], evento);
});

bus.on("momResultadoInfraccion", function (evento) {

  mw.incrementar();
  console.log("ENT: compra " + evento.id + " --> " + evento.compra.infracciones);

  evento = nucleo.actualizarAtributo(evento);

  nucleo.sumar(estado_sincro_inf_pub, evento.id, 2);
  bus.emit("sincro_inf_pub"+estado_sincro_inf_pub[evento.id], evento);
})

bus.on("momResultadoAutorizacion", function (evento) {

  mw.incrementar();
  console.log("ENT: compra " + evento.id + " pago --> " + evento.compra.pago);

  evento = nucleo.actualizarAtributo(evento);

  nucleo.sumar(estado_sincro_pub_pag, evento.id, 2);
  bus.emit("sincro_pub_pag"+estado_sincro_pub_pag[evento.id], evento);
})

bus.on("momResultadoAgendarEnvio", function (evento) {

  mw.incrementar();
  console.log("ENT: compra " + evento.id + " --> " + "destino agendado");

  evento = nucleo.actualizarAtributo(evento);

  nucleo.sumar(estado_sincro_pub_env, evento.id, 2);
  bus.emit("sincro_pub_env"+estado_sincro_pub_env[evento.id], evento);
})

/*
.............................................................
... mensajes internos
.............................................................
*/

bus.on("liberarProducto", function (evento) {

  mw.incrementar();
  console.log("INT: compra " + evento.id + " --> " + "liberada");

  evento.compra.reserva = evento.compra.reserva_valores[2]; // liberado
  evento = nucleo.actualizarAtributo(evento);

  for (var i = 0; i < reservas.length; i++){
    if (reservas[i].id === evento.id) {
      reservas.splice(i, 1);
      break;
    }
  }
});

bus.on("enviarProducto", function (evento) {

  mw.incrementar();
  console.log("INT: producto " + evento.id + " --> " + "enviado");
});

/*
.............................................................
... sincronizacion 1
se espera la llegada de dos mensajes
1) desde servidor infracciones - compra sin infracciones
2) desde servidores publicaciones - producto reservado
.............................................................
*/

bus.on("sincro_inf_pub1", function (evento) {
  console.log("INT: compra " + evento.id + " --> esperando resultado infraccion");
});

bus.on("sincro_inf_pub2", function (evento) {
  console.log("INT: compra " + evento.id + " --> esperando reserva del producto");
});

bus.on("sincro_inf_pub3", function (evento) {

  mw.incrementar();
  console.log("INT: compra " + evento.id + " --> " + "sincro 1 terminada");

  evento = nucleo.actualizarAtributo(evento);

  if(evento.compra.infracciones === evento.compra.infracciones_valores[2])
    nucleo.sumar(estado_sincro_pub_pag, evento.id, 2);

  nucleo.sumar(estado_sincro_pub_pag, evento.id, 1);
  bus.emit("sincro_pub_pag"+estado_sincro_pub_pag[evento.id], evento);
});

/*
.............................................................
... sincronizacion 2
se espera la llegada de dos mensajes
1) desde servidor pagos - el pago fue aceptado
2) desde servidores inf/pub - sin infracciones y producto reservado
.............................................................
*/

bus.on("sincro_pub_pag1", function (evento) {
  console.log("INT: compra " + evento.id + " --> esperando autorizacion de pago");
});

bus.on("sincro_pub_pag2", function (evento) {
  console.log("INT: compra " + evento.id + " --> esperando sincro 1 (infracciones/publicaciones)");
});

bus.on("sincro_pub_pag3", function (evento) {

  mw.incrementar();
  console.log("INT: compra " + evento.id + " --> " + "sincro 2 terminada");

  evento = nucleo.actualizarAtributo(evento);

  // si la compra registra infracciones o el pago fue rechazado
  if(evento.compra.infracciones === evento.compra.infracciones_valores[2] ||
    evento.compra.pago === evento.compra.pago_valores[2]){

    evento.tarea = "liberarProducto";
    bus.emit(evento.tarea, evento);
  }

  // si la compra no registra infracciones y el pago fue aceptado
  if(evento.compra.infracciones === evento.compra.infracciones_valores[1] &&
    evento.compra.pago === evento.compra.pago_valores[1]){

      nucleo.sumar(estado_sincro_pub_env, evento.id, 1);
      bus.emit("sincro_pub_env"+estado_sincro_pub_env[evento.id], evento);
  }
});

/*
.............................................................
... sincronizacion 3
se espera la llegada de dos mensajes
1) desde servidor pagos - el pago fue aceptado
2) desde servidor envios - el envio fue agendado
.............................................................
*/

bus.on("sincro_pub_env1", function (evento) {
  console.log("INT: compra " + evento.id + " --> esperando agendado del envio");
});

bus.on("sincro_pub_env2", function (evento) {
  console.log("INT: compra " + evento.id + " --> esperando sincro 2 (publicaciones/pagos)");
});

bus.on("sincro_pub_env3", function (evento) {

  mw.incrementar();
  console.log("INT: compra " + evento.id + " --> " + "sincro 3 terminada");

  evento = nucleo.actualizarAtributo(evento);

  evento.tarea = "enviarProducto";
  bus.emit(evento.tarea, evento);
});
