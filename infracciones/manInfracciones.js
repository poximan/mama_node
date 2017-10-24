/*
este modulo conoce y agrupa distintas funcionalidades que en su conjunto, dan vida al servidor ejecutado

- agrega el control principal del servidor, donde corre el nucleo del negocio.
- pide el mediador que ya fue agregado por el control.
- pide el bus de mensajes (eventEmitter) que ya fue agregado por el control.
*/

var control = require('./ctrlInfracciones');
var mediador = control.mediador;
var bus = control.bus;
var _ = require('underscore');

// ---------

var port = require("../cfg.json").manual.monitor.port_infracciones;
const Server = require('socket.io');
const server = require('http').Server();

// ---------

bus.on("resultadoInfraccion", function (evento) {
  preguntar(evento);
});

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

  socket.on("resInfraccion", function (msg) {
    var evento = buscarEvento(msg);
    
    if(evento){
      evento.compra.infracciones = msg.decision;
      evento.tarea = "momResultadoInfraccion";
      bus.emit(evento.tarea, evento);
    }
  });

  socket.on("?", function (msg) {
    socket.emit("res?", msgs_validos);
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {

  });

  function buscarEvento(msg){

    var evento;
    preguntas = _(preguntas).filter(function(item) {
      if(item.id == msg.id)
        evento = item;
      return item.id != msg.id;
    });
    return evento;
  }

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
