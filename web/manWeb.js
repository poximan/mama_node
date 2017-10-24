/*
este modulo conoce y agrupa distintas funcionalidades que en su conjunto, dan vida al servidor ejecutado

- agrega el control principal del servidor, donde corre el nucleo del negocio.
- pide el mediador que ya fue agregado por el control.
- pide el bus de mensajes (eventEmitter) que ya fue agregado por el control.
*/

var control = require('./ctrlWeb');
var mediador = control.mediador;
var bus = control.bus;
var _ = require('underscore');

// ---------

var port = require("../cfg.json").manual.monitor.port_web;
const Server = require('socket.io');
const server = require('http').Server();

// ---------

bus.on("resultadoFormaEntrega", function (evento) {
  preguntar(evento);
});

bus.on("resultadoMedioPago", function (evento) {
  preguntar(evento);
});

bus.on("resultadoConfirmar", function (evento) {
  preguntar(evento);
});

bus.on("comprar", function (evento) {
  control.comprar();
});

bus.on("persistir", function (evento) {
  mediador.persistir();
});

/*
.............................................................
... pedir publicaciones por unica vez al servidor responsable
.............................................................
*/

var get_publicaciones = {
  "tarea":"momGetPublicaciones",
  "publicaciones" : []
}

bus.emit(get_publicaciones.tarea, get_publicaciones);

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

  socket.on("?resumen", function (msg) {
    socket.emit("resumen", reporte);
  });

  socket.on("?", function (msg) {
    socket.emit("res?", msgs_validos);
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
  ... reporte datos del servidor
  .............................................................
  */

  var reporte = { totales:-1, aceptadas:-1, canceladas:-1, en_curso:-1};

  setInterval ( function() {

    if(reporte.totales !== mediador.estadisticas.totales ||
        reporte.aceptadas !== mediador.estadisticas.aceptadas ||
        reporte.canceladas !== mediador.estadisticas.canceladas ||
        reporte.en_curso !== mediador.estadisticas.en_curso){

          reporte = mediador.estadisticas;
          socket.emit("resumen", reporte);
        }

  }, 2000);
  
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
