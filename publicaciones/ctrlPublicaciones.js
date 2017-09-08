var amqp = require('amqplib/callback_api');
var publicador = require("../mod_pub");
var bus = require('../eventBus');
var fs = require('fs');
var async = require('async');

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
