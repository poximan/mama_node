var port = require("../cfg.json").manual.monitor.port_compras;

const Server = require('socket.io');
const server = require('http').Server();

var io = Server(port);

io.close(); // Close current server
io = Server(server);

var _ = require("underscore");
var bus = require('../eventBus');

var preguntas = new Array();
var mediador;

exports.mediador = function(mom_mediador) {
  mediador = mom_mediador;
}

exports.preguntar = function(evento) {
  preguntas.push(evento);
}

io.on('connection', function (socket) {

  socket.on("get", function (msg) {

    preguntas.forEach(function(evento) {
      socket.emit(evento.tarea, evento);
    });
  });

  socket.on("estado", function (msg) {

    console.log("respondiendo estado del servidor");
    socket.emit("resEstado", [mediador.compras, preguntas]);
  });

  socket.on("persistir", function (msg) {
    bus.emit("persistir", msg);
  });

  socket.on("?", function (msg) {
    socket.emit("res?", msgs_validos);
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {

  });

  /*
  .............................................................
  ... preparar mensajes validos
  .............................................................
  */

  var reporte = { totales:0, aceptadas:0, rechazadas:0, en_curso:0};

  setInterval ( function() {

    console.log(reporte);
    console.log(mediador.estadisticas);

    if(reporte.totales !== mediador.estadisticas.totales ||
        reporte.aceptadas !== mediador.estadisticas.aceptadas ||
        reporte.rechazadas !== mediador.estadisticas.rechazadas ||
        reporte.en_curso !== mediador.estadisticas.en_curso){

          reporte = mediador.estadisticas;
          socket.emit("resumen", reporte);
        }

  }, 10000);

  var msgs = socket._events;
  var msgs_validos = [];

  delete msgs.disconnect;

  for (var key in msgs) {
     msgs_validos.push(key);
  }
});

server.listen(port, function () {

  console.log("--------------------------");
  console.log('Escuchando en puerto %d', port);
  console.log("--------------------------");
});
