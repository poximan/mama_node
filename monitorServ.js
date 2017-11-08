/*
este modulo conoce y agrupa distintas funcionalidades que en su conjunto,
hacen funcionar un servidor en particular

incluye
-------
- puerto socket bidireccional, para reporte de estados y comandos (solo en manual)
- control principal del servidor, donde corre el nucleo del negocio.
- mediador MOM <--> Negocio. el mismo que usa el control.
- bus de mensajes (eventEmitter). el mismo que usa el control.
- servidor http para montar un servicio basado en socket.io

bus --> concentra los eventos locales
io --> concentra los evento de E/S por socket
*/
var _ = require('underscore');

module.exports = function(puerto, control) {

  var module = {};

  var mediador = control.mediador;
  var bus = control.bus;

  // ---------

  const Server = require('socket.io');
  const server = require('http').Server();

  // ---------

  bus.on("persistir", function (evento) {
    mediador.persistir();
  });

  bus.on("corte", function (evento) {

    var tarea = "momCorte";
    var evento = {tarea};

    console.log("GLOBAL: comienza corte consistente");
    bus.emit(evento.tarea, evento);
  });

  /*
  .............................................................
  ... respuestas desde cliente web
  .............................................................
  */

  var io = Server(puerto);

  io.close(); // Close current server
  io = Server(server);
  module.io = io;

  var preguntas = new Array();

  module.preguntar = function(evento) {
    preguntas.push(evento);
  }

  io.on('connection', function (socket) {

    mediador.sockRespuesta(socket);

    socket.on("get", function (msg) {

      preguntas.forEach(function(evento) {
        socket.emit(evento.tarea, evento);
      });
    });

    socket.on("estado", function (msg) {

      console.log("respondiendo estado del servidor");
      socket.emit("resEstado", [mediador.totales(), preguntas]);
    });

    socket.on("persistir", function (msg) {
      bus.emit("persistir", msg);
    });

    socket.on("corte", function (msg) {
      bus.emit("corte", msg);
    });

    socket.on("?resumen", function (msg) {
      socket.emit("resumen", reporte);
    });

    socket.on("?", function (msg) {
      socket.emit("res?", msgs_validos);
    });

    module.buscarEvento = function(msg){

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

    var canceladas = {confirmacion:-1, autorizacion:-1, infraccion:-1};
    var reporte = { totales:-1, aceptadas:-1, canceladas, en_curso:-1};

    setInterval ( function() {

      if(true || reporte.totales !== mediador.estadisticas.totales ||
          reporte.aceptadas !== mediador.estadisticas.aceptadas ||
          reporte.canceladas.confirmacion !== mediador.estadisticas.canceladas.confirmacion ||
          reporte.canceladas.autorizacion !== mediador.estadisticas.canceladas.autorizacion ||
          reporte.canceladas.infraccion !== mediador.estadisticas.canceladas.infraccion ||
          reporte.en_curso !== mediador.estadisticas.en_curso){

            reporte = mediador.estadisticas;
            socket.emit("resumen", reporte);
          }

    }, 1000);

    /*
    .............................................................
    ... preparar mensajes validos
    .............................................................
    */

    var msgs_validos = [];
    module.agendarEventos = function(modo) {

      var msgs = socket._events;

      for (var key in msgs) {
        // si esta en manual
        if(modo === "man" ||
          // si esta en automatico
          (key === "?" || key === "estado" || key === "?resumen"))
        msgs_validos.push(key);
      }
    }
    this.agendarEventos;
  });

  server.listen(puerto, function () {

    console.log("--------------------------");
    console.log('Escuchando en puerto %d', puerto);
    console.log("--------------------------");
  });

  return module;
};
