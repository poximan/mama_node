var p_envio_correo = require("../cfg.json").probabilidad.cliente.correo;
var p_pago_debito = require("../cfg.json").probabilidad.cliente.debito;
var p_confirmar = require("../cfg.json").probabilidad.cliente.confirma;

/*
.............................................................
... respuestas simuladas
.............................................................
*/

exports.metodoEnvio = function(evento) {
  if(probabilidad() <= p_envio_correo)
    evento.data.compra.entrega.estado = evento.data.compra.entrega.estados[2];  // correo
  else
    evento.data.compra.entrega.estado = evento.data.compra.entrega.estados[1];  // retira
}

exports.metodoPago = function(evento) {
  if(probabilidad() <= p_pago_debito)
    evento.data.compra.pago.medio = evento.data.compra.pago.medios[0];  // debito
  else
    evento.data.compra.pago.medio = evento.data.compra.pago.medios[1];  // credito
}

exports.confirmar = function(evento) {
  if(probabilidad() <= p_confirmar)
    evento.data.compra.estado = evento.data.compra.estados[1];  // confirma
  else
    evento.data.compra.estado = evento.data.compra.estados[2];  // cancela
}

function probabilidad() {
  return Math.random() * 100;
}
