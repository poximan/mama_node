var ip = require("../../cfg.json").manual.monitor.ip_compras;
var port = require("../../cfg.json").manual.monitor.port_compras;

const socket = require('socket.io-client')(ip + ":" + port);
var msgs_validos_remotos;

var socket_monitor;

socket.on('connect', () => {
  console.log("ServCompras: conectado");
});

socket.on('disconnect', () => {
  console.log("ServCompras: desconectado");
});

socket.on("resumen", (contadores) => {
  socket_monitor.emit("resumen", contadores);
});

socket.on("resEstado", (preguntas) => {
  console.log("ServCompras: estado respondido");
  socket_monitor.emit("resEstado", preguntas);
});

socket.on("res?", (msgs_validos) => {

  msgs_validos_remotos = msgs_validos;
  var respuesta = ["ServCompras: mensajes validos son {", msgs_validos_remotos, "}"];

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
  console.log("ServCompras: comando \"" + comando + "\" -->", (coincidencia?"valido":"invalido"));
  return coincidencia;
}

socket.emit("?", null);

/*
.............................................................
... variables expuestas
.............................................................
*/

exports.conector = {socket, esValido, retorno};
