var bus = require('../eventBus');

/*
.............................................................
... respuestas simuladas
.............................................................
*/

bus.on("resultadoCosto", function (evento) {
  evento.data.compra.adic_envio.valor = costo();
});

function costo() {
  return Math.ceil(probabilidad());
}

function probabilidad() {
  return Math.random() * 100;
}
