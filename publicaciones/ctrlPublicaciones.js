require("../mom/momSuscriptor").suscribir("cola_publicaciones");

var bus = require('../eventBus');

/*
param 1 = indice del que es responsable en reloj vectorial
param 2 = coleccion en donde persiten sus documentos este servidor
param 3 = cantidad de respuetas que espera para fin corte consistente
*/
var mediador = require("../mom/momMediador")(1, "colecc_publicaciones", 4);


// ---------

exports.mediador = mediador;
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

      mediador.publicar("web", evento);
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

  mediador.incrementar();
  console.log("ENT: compra " + evento.id + " --> " + "producto reservado");
  reservas.push(evento);

  evento = mediador.actualizarAtributo(evento);

  sumar(estado_sincro_inf_pub, evento.id, 1);
  bus.emit("sincro_inf_pub"+estado_sincro_inf_pub[evento.id], evento);
});

bus.on("momResultadoInfraccion", function (evento) {

  mediador.incrementar();
  console.log("ENT: compra " + evento.id + " --> " + evento.compra.infracciones);

  evento = mediador.actualizarAtributo(evento);

  sumar(estado_sincro_inf_pub, evento.id, 2);
  bus.emit("sincro_inf_pub"+estado_sincro_inf_pub[evento.id], evento);
})

bus.on("momResultadoAutorizacion", function (evento) {

  mediador.incrementar();
  console.log("ENT: compra " + evento.id + " pago --> " + evento.compra.pago);

  evento = mediador.actualizarAtributo(evento);

  sumar(estado_sincro_pub_pag, evento.id, 2);
  bus.emit("sincro_pub_pag"+estado_sincro_pub_pag[evento.id], evento);
})

bus.on("momResultadoAgendarEnvio", function (evento) {

  mediador.incrementar();
  console.log("ENT: compra " + evento.id + " --> " + "destino agendado");

  evento = mediador.actualizarAtributo(evento);

  sumar(estado_sincro_pub_env, evento.id, 2);
  bus.emit("sincro_pub_env"+estado_sincro_pub_env[evento.id], evento);
})

/*
.............................................................
... mensajes internos
.............................................................
*/

bus.on("liberarProducto", function (evento) {

  mediador.incrementar();
  console.log("INT: compra " + evento.id + " --> " + "liberada");

  for (var i = 0; i < reservas.length; i++){
    if (reservas[i].id === evento.id) {
      reservas.splice(i, 1);
      break;
    }
  }
});

bus.on("enviarProducto", function (evento) {

  mediador.incrementar();
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
  console.log("INT: esperando resultado infraccion");
});

bus.on("sincro_inf_pub2", function (evento) {
  console.log("INT: esperando reserva del producto");
});

bus.on("sincro_inf_pub3", function (evento) {

  mediador.incrementar();
  console.log("INT: compra " + evento.id + " --> " + "sincro 1 terminada");

  evento = mediador.actualizarAtributo(evento);

  sumar(estado_sincro_pub_pag, evento.id, 1);
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
  console.log("INT: esperando autorizacion de pago");
});

bus.on("sincro_pub_pag2", function (evento) {
  console.log("INT: esperando sincro 1 (infracciones/publicaciones)");
});

bus.on("sincro_pub_pag3", function (evento) {

  mediador.incrementar();
  console.log("INT: compra " + evento.id + " --> " + "sincro 2 terminada");

  evento = mediador.actualizarAtributo(evento);

  // si la compra registra infracciones o el pago fue rechazado
  if(evento.compra.infracciones === evento.compra.infracciones_valores[2] ||
    evento.compra.pago === evento.compra.pago_valores[2]){

    evento.tarea = "liberarProducto";
    bus.emit(evento.tarea, evento);
  }

  // si la compra no registra infracciones y el pago fue aceptado
  if(evento.compra.infracciones === evento.compra.infracciones_valores[1] ||
    evento.compra.pago === evento.compra.pago_valores[1]){

      sumar(estado_sincro_pub_env, evento.id, 1);
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
  console.log("INT: esperando agendado del envio");
});

bus.on("sincro_pub_env2", function (evento) {
  console.log("INT: esperando sincro 2 (publicaciones/pagos)");
});

bus.on("sincro_pub_env3", function (evento) {

  mediador.incrementar();
  console.log("INT: compra " + evento.id + " --> " + "sincro 3 terminada");

  evento = mediador.actualizarAtributo(evento);

  evento.tarea = "enviarProducto";
  bus.emit(evento.tarea, evento);
});

/*
.............................................................
... auxiliar
.............................................................
*/

function sumar(estado_sincro, indice_objetivo, incremento){

  while(estado_sincro.length <= indice_objetivo)
    estado_sincro.push(0);

  estado_sincro[indice_objetivo] += incremento;
}
