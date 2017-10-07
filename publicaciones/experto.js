var bus = require('../eventBus');

/*
.............................................................
... respuestas simuladas
.............................................................
*/

bus.on("resultadoStock", function (publicacion) {
  publicacion.cantidad = cantidad();
});

function cantidad() {
  return Math.ceil(probabilidad());
}

function probabilidad() {
  return Math.random() * 10;
}
