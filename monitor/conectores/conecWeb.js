var ip = require("../../cfg.json").monitor.ip_web;
var port = require("../../cfg.json").monitor.port_web;

const socket = require('socket.io-client')(ip + ":" + port);

var msgs_validos_remotos;
var socket_monitor;
var respuestas = [];
var u_corte = {};

function responderSockMon(nombre_evento, contenido){

  if(typeof socket_monitor !== "undefined"){

    socket_monitor.emit(nombre_evento, contenido);

    while(respuestas.length > 0)
      socket_monitor.emit(respuestas.pop());
  }
  else
    respuestas.push([nombre_evento, contenido]);
}

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

socket.on("resReloj", (reloj) => {
  responderSockMon("resReloj", reloj);
});

socket.on("resuCorte", (corte_consistente) => {
  responderSockMon("resCorte", u_corte);
});

socket.on("resCorte", (corte_consistente) => {
  u_corte = corte_consistente;
});

socket.on("resumen", (contadores) => {
  responderSockMon("resumen", contadores);
});

socket.on("resEstado", (preguntas) => {
  console.log("ServWeb: estado respondido");
  responderSockMon("resEstado", preguntas);
});

socket.on("res?", (msgs_validos) => {

  msgs_validos_remotos = msgs_validos;
  msgs_validos = msgs_validos.filter(function(item){
    return item !== "?resumen";
  });

  var respuesta = ["ServCompras: mensajes validos son {", msgs_validos, "}"];
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

  if(msgs_validos_remotos)
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
