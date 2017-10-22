var ip_infracciones = require("../../cfg.json").manual.monitor.ip_infracciones;
var port_infracciones = require("../../cfg.json").manual.monitor.port_infracciones;

const socket = require('socket.io-client')(ip_infracciones + ":" + port_infracciones);
var msgs_validos_remotos;

var socket_monitor;

socket.on('connect', () => {
  console.log("ServInfracciones: conectado");
});

socket.on('disconnect', () => {
  console.log("ServInfracciones: desconectado");
});

socket.on("resultadoInfraccion", (preguntas) => {
  console.log("ServInfracciones: pregunta si existe infraccion");
  socket_monitor.emit("resultadoInfraccion", preguntas);
});

socket.on("resEstado", (preguntas) => {
  console.log("ServInfracciones: estado respondido");
  socket_monitor.emit("resEstado", preguntas);
});

socket.on("res?", (msgs_validos) => {

  msgs_validos_remotos = msgs_validos;
  var respuesta = ["ServInfracciones: mensajes validos son {", msgs_validos_remotos, "}"];

  if(socket_monitor !== undefined)
    socket_monitor.emit("res?", respuesta);
});

/*
.............................................................
... preparar mensajes validos
.............................................................
*/

retorno = function(socket){
  socket_monitor = socket;
}

/*
.............................................................
... preparar mensajes validos
.............................................................
*/

var msgs = socket._callbacks;
var msgs_validos = [];

delete msgs.$connecting;
delete msgs.$connect;
delete msgs.$disconnect;

for (var key in msgs) {
   msgs_validos.push(key);
}

/*
.............................................................
... validador
.............................................................
*/

function esValido(comando){

  var coincidencia = false;

  msgs_validos_remotos.forEach(function(msg){
    if(comando === msg)
      coincidencia = true;
  });
  console.log("ServInfracciones: comando \"" + comando + "\" -->", (coincidencia?"valido":"invalido"));
  return coincidencia;
}

socket.emit("?", null);

/*
.............................................................
... variables expuestas
.............................................................
*/

exports.conector = {socket, esValido, retorno};
