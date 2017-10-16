var p_envio_correo = require("../cfg.json").automatico.probabilidad.cliente.correo;
var p_pago_debito = require("../cfg.json").automatico.probabilidad.cliente.debito;
var p_confirmar = require("../cfg.json").automatico.probabilidad.cliente.confirma;

/*
.............................................................
... respuestas simuladas
.............................................................
*/

exports.metodoEnvio = function(evento) {
  if(probabilidad() <= p_envio_correo)
    evento.compra.entrega = evento.compra.entrega_valores[2];  // correo
  else
    evento.compra.entrega = evento.compra.entrega_valores[1];  // retira
}

exports.metodoPago = function(evento) {
  if(probabilidad() <= p_pago_debito)
    evento.compra.medio = evento.compra.medios[0];  // debito
  else
    evento.compra.medio = evento.compra.medios[1];  // credito
}

exports.confirmar = function(evento) {
  if(probabilidad() <= p_confirmar)
    evento.compra.estado = evento.compra.estados[1];  // confirma
  else
    evento.compra.estado = evento.compra.estados[2];  // cancela
}

function probabilidad() {
  return Math.random() * 100;
}
