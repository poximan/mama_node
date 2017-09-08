var amqp = require('amqplib/callback_api');
var publicador = require("../mod_pub");
var bus = require('../eventBus');
var fs = require('fs');
var async = require('async');

var reservas = [];

var value = 0, // can be replaced by a fixed value
    size  = 1000, // can be replaced by a fixed value
    estado_sincro_inf_pub = Array.apply(null,{length: size}).map(function() { return value; });

/*
la concurrencia del sistema impide saber que mensaje llegara primero.
para evitar la posible perdida de la respuesta desde el servidor de infracciones
se salva el valor aqui, para luego ser recuperado en el punto de sincronizacion
*/
var estado_inf = null;

bus.on("getPublicaciones", function (evento) {

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
      evento.tarea = "resultadoPublicaciones";
      evento.data = msg;
      callback(null);
    },
    function(callback) {
      publicador("web", evento);
      callback(null);
    }
  ];

  async.waterfall(operaciones, function (err, evento) {
    console.log("enviando publicaciones conocidas");
  });
});

bus.on("publicacionSeleccionada", function (evento) {

  evento.tarea = "resultadoReserva";
  console.log("producto " + evento.id + " reservado");
  reservas.push(evento);

  estado_sincro_inf_pub[evento.id] += 1;
  bus.emit("sincro_inf_pub"+estado_sincro_inf_pub[evento.id], evento);
});

bus.on("resultadoInfraccion", function (evento) {

  estado_inf = evento.data.publicacion.infracciones.estado;

  estado_sincro_inf_pub[evento.id] += 2;
  bus.emit("sincro_inf_pub"+estado_sincro_inf_pub[evento.id], evento);
})

bus.on("sincro_inf_pub1", function (evento) {
  console.log("esperando resultado infraccion");
});

bus.on("sincro_inf_pub2", function (evento) {

  console.log("se obtuvo resultado infraccion");
  console.log("esperando reserva del producto");
});

bus.on("sincro_inf_pub3", function (evento) {

  evento.data.publicacion.infracciones.estado = estado_inf;
  estado_inf = null;

  console.log("punto de sincronizacion alcanzado");
  console.log(evento.data.publicacion.infracciones.estado);
});
