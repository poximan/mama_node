var amqp = require('amqplib/callback_api');
var bus = require('../eventBus');
require('./ctrlWeb');
var async = require('async');

//process.env.AMQP_URL = 'amqp://localhost';
process.env.AMQP_URL = 'amqp://cmbsdecq:-tiB--pIwH6F0HO0k6rUEfos_K5U7UpW@crane.rmq.cloudamqp.com/cmbsdecq';

var publicaciones = [];

amqp.connect(process.env.AMQP_URL, function(err, conn) {
  conn.createChannel(function(err, ch) {

    ch.checkQueue("cola_web", function(err, q) {

      ch.consume(q.queue, function(msg) {

        // msg origianl es {fields, properties, content}
        var evento = JSON.parse(msg.content.toString());

        // en función del nombre del evento procesa el mensaje de forma automática
        bus.emit(evento.tarea, evento);
        ch.ack(msg);
      }, {noAck: false});
    });
  });
});

/*
.............................................................
... pedir publicaciones por unica vez al servidor responsable
.............................................................
*/
var get_publicaciones = {
  "tarea":"getPublicaciones",
  "id":"",
  "data" : {
  }
}
bus.emit(get_publicaciones.tarea, get_publicaciones);

/*
.............................................................
... generar nuevas compras usando publicaciones conocidas
.............................................................
*/
function comprar() {

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
      console.log("\nemitiendo compra --> " + evento.data.publicacion.descripcion.valor);
      bus.emit(evento.tarea, evento);
    });
  }
}
setInterval(comprar, 20000);

/*
.............................................................
... eventos del simulador
.............................................................
*/
bus.on("cargarPublicaciones", function (evento) {
  publicaciones = evento.data;
});

bus.on("resultadoConfirma", function (evento) {
  confirmaCompra(evento);
});

bus.on("resultadoEnvio", function (evento) {
  metodoEnvio(evento);
});

function confirmaCompra(evento) {
  if(probabilidad() > 30)
    evento.data.compra.estado = evento.data.compra.estados[1];  // confirma
  else
    evento.data.compra.estado = evento.data.compra.estados[2];  // cancela
}

function metodoEnvio(evento) {
  if(probabilidad() > 20)
    evento.data.compra.entrega.estado = evento.data.compra.entrega.estados[2];  // correo
  else
    evento.data.compra.entrega.estado = evento.data.compra.entrega.estados[1];  // retira
}

function probabilidad() {
  return Math.random() * 100;
}

function indicePublicacionElegida() {
  return Math.floor(Math.random() * 10);
}
