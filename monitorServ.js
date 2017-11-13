/*
- puerto socket bidireccional, para reporte de estados y comandos (solo en manual).
- nucleo comun a todos los servidores del negocio.
- bus de mensajes (eventEmitter). el mismo para todo el servidor.
- servidor http para montar un servicio basado en socket.io

bus --> concentra los eventos locales
io --> concentra los evento de E/S por socket
*/
var _ = require('underscore');

module.exports = function(puerto, nucleo, bus) {

  var module = {};

  // ---------

  const Server = require('socket.io');
  const server = require('http').Server();

  // ---------

  bus.on("persistir", function (evento) {
    nucleo.persistir();
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

    nucleo.mw.sockRespuesta(socket);

    socket.on("get", function (msg) {

      preguntas.forEach(function(evento) {
        socket.emit(evento.tarea, evento);
      });
    });

    socket.on("estado", function (msg) {

      console.log("respondiendo estado del servidor");
      socket.emit("resEstado", [nucleo.compras(), preguntas]);
    });

    socket.on("persistir", function (msg) {
      bus.emit("persistir", msg);
    });

    socket.on("reloj", function (msg) {
      var resp = {vector:nucleo.mw.vector(), indice:nucleo.mw.indice()};
      socket.emit("resReloj", resp);
    });

    socket.on("corte", function (msg) {
      bus.emit("corte", msg);
    });

    socket.on("ouch", function (msg) {
      nucleo.caida();
    });

    // ultimo corte
    socket.on("uCorte", function (msg) {
      socket.emit("resuCorte", reporte);
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
    var reporte = {totales:-1, aceptadas:-1, canceladas, en_curso:-1};

    setInterval ( function() {

      if(reporte.totales !== nucleo.estadisticas.totales ||
          reporte.aceptadas !== nucleo.estadisticas.aceptadas ||
          reporte.canceladas.confirmacion !== nucleo.estadisticas.canceladas.confirmacion ||
          reporte.canceladas.autorizacion !== nucleo.estadisticas.canceladas.autorizacion ||
          reporte.canceladas.infraccion !== nucleo.estadisticas.canceladas.infraccion ||
          reporte.en_curso !== nucleo.estadisticas.en_curso){

            reporte = JSON.parse(JSON.stringify(nucleo.estadisticas));
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
        if(modo === "man"
          || // si esta en automatico
            (key === "?"
            || key === "estado"
            || key === "?resumen"
            || key === "uCorte"
            || key === "reloj")
          )
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
