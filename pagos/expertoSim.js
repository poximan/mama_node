var p_autorizacion = require("../cfg.json").automatico.probabilidad.autorizacion;

/*
.............................................................
... respuestas simuladas
.............................................................
*/

exports.autorizar = function(evento) {

  if(probabilidad() <= p_autorizacion)
    evento.compra.pago = evento.compra.pago_valores[1]; // autorizado
  else
    evento.compra.pago = evento.compra.pago_valores[2]; // rechazado
}

function probabilidad() {
  return Math.random() * 100;
}
