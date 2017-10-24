var port = require("../cfg.json").manual.monitor.port_web;

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

  socket.on("comprar", function (msg) {
    bus.emit("comprar", msg);
  });

  socket.on("resEntrega", function (msg) {
    var evento = buscarEvento(msg);

    if(evento){
      evento.compra.entrega = msg.decision;
      evento.tarea = "momResultadoFormaEntrega";
      bus.emit(evento.tarea, evento);
    }
  });

  socket.on("resPago", function (msg) {

    var evento = buscarEvento(msg);

    if(evento){
      evento.compra.medio = msg.decision;
      evento.tarea = "momResultadoMedioPago";
      bus.emit(evento.tarea, evento);
    }
  });

  socket.on("resConfirma", function (msg) {

    var evento = buscarEvento(msg);

    if(evento){
      evento.compra.estado = msg.decision;
      evento.tarea = "momResultadoConfirmar";
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
