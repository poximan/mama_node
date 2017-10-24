/*
este modulo conoce y agrupa distintas funcionalidades que en su conjunto, dan vida al servidor ejecutado

- agrega el control principal del servidor, donde corre el nucleo del negocio.
- pide el mediador que ya fue agregado por el control.
- pide el bus de mensajes (eventEmitter) que ya fue agregado por el control.
*/

var control = require('./ctrlPublicaciones');
var mediador = control.mediador;
var bus = control.bus;

// ---------

var port = require("../cfg.json").manual.monitor.port_publicaciones;
const Server = require('socket.io');
const server = require('http').Server();

// ---------

bus.on("persistir", function (evento) {
  mediador.persistir();
});

/*
.............................................................
... respuestas desde cliente web
.............................................................
*/

var io = Server(port);

io.close(); // Close current server
io = Server(server);

var preguntas = new Array();

preguntar = function(evento) {
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
    socket.emit("resEstado", [mediador.totales, preguntas]);
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
