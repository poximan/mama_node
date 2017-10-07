var p_infraccion = require("../cfg.json").probabilidad.infraccion;

/*
.............................................................
... respuestas simuladas
.............................................................
*/

exports.existeInfraccion = function(evento) {

  if(probabilidad() <= p_infraccion)
    evento.data.publicacion.infracciones.estado = evento.data.publicacion.infracciones.estados[1]; // con_infr
  else
    evento.data.publicacion.infracciones.estado = evento.data.publicacion.infracciones.estados[2]; // sin_infr
}

function probabilidad() {
  return Math.random() * 100;
}
