var p_autorizacion = require("../cfg.json").probabilidad.autorizacion;

/*
.............................................................
... respuestas simuladas
.............................................................
*/

exports.autorizar = function(evento) {

  if(probabilidad() <= p_autorizacion)
    evento.data.compra.pago.estado = evento.data.compra.pago.estados[1]; // autorizado
  else
    evento.data.compra.pago.estado = evento.data.compra.pago.estados[2]; // rechazado
}

function probabilidad() {
  return Math.random() * 100;
}
