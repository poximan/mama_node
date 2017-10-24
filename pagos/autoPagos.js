/*
este modulo conoce y agrupa distintas funcionalidades que en su conjunto, dan vida al servidor ejecutado

- agrega el control principal del servidor, donde corre el nucleo del negocio.
- pide el mediador que ya fue agregado por el control.
- pide el bus de mensajes (eventEmitter) que ya fue agregado por el control.
*/

var control = require('./ctrlPagos');
var mediador = control.mediador;
var bus = control.bus;

var periodo_persistencia = require("../cfg.json").automatico.persistencia.periodo;
var probab_autorizacion = require("../cfg.json").automatico.probabilidad.autorizacion;

// ---------

setInterval(mediador.persistir, periodo_persistencia);

// ---------

bus.on("resultadoAutorizacion", function (evento) {
  experto.autorizar(evento);

  evento.tarea = "momResultadoAutorizacion";
  bus.emit(evento.tarea, evento);
});

/*
.............................................................
... respuestas simuladas
.............................................................
*/

autorizar = function(evento) {

  if(probabilidad() <= probab_autorizacion)
    evento.compra.pago = evento.compra.pago_valores[1]; // autorizado
  else
    evento.compra.pago = evento.compra.pago_valores[2]; // rechazado
}

function probabilidad() {
  return Math.random() * 100;
}
