var ip = require("../../cfg.json").manual.monitor.ip_envios;
var port = require("../../cfg.json").manual.monitor.port_envios;

const socket = require('socket.io-client')(ip + ":" + port);
var msgs_validos_remotos;

var socket_monitor;
var respuestas = [];

function responderSockMon(nombre_evento, contenido){

  if(socket_monitor !== undefined){

    socket_monitor.emit(nombre_evento, contenido);

    while(respuestas.length > 0)
      socket_monitor.emit(respuestas.pop());
  }
  else
      respuestas.push([nombre_evento, contenido]);
}

socket.on("resultadoCosto", (preguntas) => {
  console.log("ServEnvios: pregunta costo envio");
  socket_monitor.emit("resultadoCosto", preguntas);
});

socket.on("resumen", (contadores) => {
  responderSockMon("resumen", contadores);
});

socket.on("resEstado", (preguntas) => {
  console.log("ServEnvios: estado respondido");
  responderSockMon("resEstado", preguntas);
});

socket.on("res?", (msgs_validos) => {

  msgs_validos_remotos = msgs_validos;
  var respuesta = ["ServEnvios: mensajes validos son {", msgs_validos_remotos, "}"];

  responderSockMon("res?", respuesta);
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
  console.log("ServEnvios: comando \"" + comando + "\" -->", (coincidencia?"valido":"invalido"));
  return coincidencia;
}

socket.emit("?", null);

/*
.............................................................
... variables expuestas
.............................................................
*/

exports.conector = {socket, esValido, retorno};
