
/*
.............................................................
... respuestas simuladas
.............................................................
*/

exports.costo = function(evento) {
  evento.compra.adic_envio = Math.ceil(probabilidad());
}

function probabilidad() {
  return Math.random() * 100;
}
