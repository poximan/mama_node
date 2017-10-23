var ip = require("../../cfg.json").manual.monitor.ip_envios;
var port = require("../../cfg.json").manual.monitor.port_envios;

const socket = require('socket.io-client')(ip + ":" + port);
var msgs_validos_remotos;

var socket_monitor;

socket.on('connect', () => {
  console.log("ServEnvios: conectado");
});

socket.on('disconnect', () => {
  console.log("ServEnvios: desconectado");
});

socket.on("resultadoCosto", (preguntas) => {
  console.log("ServEnvios: pregunta costo envio");
  socket_monitor.emit("resultadoCosto", preguntas);
});

socket.on("resEstado", (preguntas) => {
  console.log("ServEnvios: estado respondido");
  socket_monitor.emit("resEstado", preguntas);
});

socket.on("res?", (msgs_validos) => {

  msgs_validos_remotos = msgs_validos;
  var respuesta = ["ServEnvios: mensajes validos son {", msgs_validos_remotos, "}"];

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
