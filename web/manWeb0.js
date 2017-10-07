var amqp = require('amqplib/callback_api');
var bus = require('../eventBus');
require('./ctrlWeb');
var async = require('async');

var port_web = require("../cfg.json").monitor.port_web;

var fs = require('fs')
    , http = require('http')
    , socketio = require('socket.io');

process.env.AMQP_URL = require("../cfg.json").amqp.url;

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
... escuchar puerto de mantenimiento
.............................................................
*/

var server = http.createServer(function(req, res) {
    res.writeHead(200, { 'Content-type': 'text/html'});
    res.end(fs.readFileSync(__dirname + '/manWeb.html'));

}).listen(port_web, function() {
    console.log('...');
});

var ind_res;
var id_compra;
var mem_evento;

socketio.listen(server).on('connection', function (socket) {

  socket.on('message', function (msg) {

    if(msg === "nuevaCompra")
      comprar();

    if((msg.match(/resFormaEntrega/g) || []).length > 0){

      ind_res = msg.split("=")[1]; // el argumento despues del "="
      id_compra = msg.split(":")[0]; // el argumento despues del "="
      console.log("res. " + ind_res + ", en compra " + id_compra);

      mem_evento.data.compra.entrega.estado = mem_evento.data.compra.entrega.estados[ind_res];
    }
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
      bus.emit(evento.tarea, evento);
    });
  }
}

/*
.............................................................
... respuestas simuladas
.............................................................
*/

bus.on("cargarPublicaciones", function (evento) {
  publicaciones = evento.data;
});

bus.on("resultadoFormaEntrega", function (evento) {
  console.log("SAL MAN: compra " + evento.id + " forma de entrega. usar [{id_compra}:resFormaEntrega={1,2}]");
  mem_evento = evento;
});

bus.on("resultadoMedioPago", function (evento) {
  metodoPago(evento);
});

bus.on("resultadoConfirmar", function (evento) {
  confirmar(evento);
});

function confirmar(evento) {
  if(probabilidad() > 30)
    evento.data.compra.estado = evento.data.compra.estados[1];  // confirma
  else
    evento.data.compra.estado = evento.data.compra.estados[2];  // cancela
}

function metodoPago(evento) {
  if(probabilidad() > 50)
    evento.data.compra.pago.medio = evento.data.compra.pago.medios[0];  // debito
  else
    evento.data.compra.pago.medio = evento.data.compra.pago.medios[1];  // credito
}

function probabilidad() {
  return Math.random() * 100;
}

function indicePublicacionElegida() {
  return Math.floor(Math.random() * publicaciones.length);
}
