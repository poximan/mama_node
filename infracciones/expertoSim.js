var p_infraccion = require("../cfg.json").automatico.probabilidad.infraccion;

/*
.............................................................
... respuestas simuladas
.............................................................
*/

exports.existeInfraccion = function(evento) {

  if(probabilidad() <= p_infraccion)
    evento.compra.infracciones = evento.compra.infracciones_valores[2]; // con_infr
  else
    evento.compra.infracciones = evento.compra.infracciones_valores[1]; // sin_infr
}

function probabilidad() {
  return Math.random() * 100;
}
