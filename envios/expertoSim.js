
/*
.............................................................
... respuestas simuladas
.............................................................
*/

exports.costo = function(evento) {
  evento.data.compra.adic_envio.valor = Math.ceil(probabilidad());
}

function probabilidad() {
  return Math.random() * 100;
}
