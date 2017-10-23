var ip = require("../../cfg.json").manual.monitor.ip_web;
var port = require("../../cfg.json").manual.monitor.port_web;

const socket = require('socket.io-client')(ip + ":" + port);
var msgs_validos_remotos;

var socket_monitor;

socket.on('connect', () => {
  console.log("ServWeb: conectado");
});

socket.on('disconnect', () => {
  console.log("ServWeb: desconectado");
});

socket.on("resultadoFormaEntrega", (preguntas) => {
  console.log("ServWeb: pregunta forma de entrega");
  socket_monitor.emit("resultadoFormaEntrega", preguntas);
});

socket.on("resultadoMedioPago", (preguntas) => {
  console.log("ServWeb: pregunta medio de pago");
  socket_monitor.emit("resultadoMedioPago", preguntas);
});

socket.on("resultadoConfirmar", (preguntas) => {
  console.log("ServWeb: pregunta confirma compra");
  socket_monitor.emit("resultadoConfirmar", preguntas);
});

socket.on("resEstado", (preguntas) => {
  console.log("ServWeb: estado respondido");
  socket_monitor.emit("resEstado", preguntas);
});

socket.on("res?", (msgs_validos) => {

  msgs_validos_remotos = msgs_validos;
  var respuesta = ["ServWeb: mensajes validos son {", msgs_validos_remotos, "}"];

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
  console.log("ServWeb: comando \"" + comando + "\" -->", (coincidencia?"valido":"invalido"));
  return coincidencia;
}

socket.emit("?", null);

/*
.............................................................
... variables expuestas
.............................................................
*/

exports.conector = {socket, esValido, retorno};
