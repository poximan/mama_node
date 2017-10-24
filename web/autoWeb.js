/*
este modulo conoce y agrupa distintas funcionalidades que en su conjunto, dan vida al servidor ejecutado

- agrega el control principal del servidor, donde corre el nucleo del negocio.
- pide el mediador que ya fue agregado por el control.
- pide el bus de mensajes (eventEmitter) que ya fue agregado por el control.
*/

var control = require('./ctrlWeb');
var mediador = control.mediador;
var bus = control.bus;

var periodo_persistencia = require("../cfg.json").automatico.persistencia.periodo;
var periodo_comprar = require("../cfg.json").automatico.nueva_compra.periodo;
var probab_envio_correo = require("../cfg.json").automatico.probabilidad.cliente.correo;
var probab_pago_debito = require("../cfg.json").automatico.probabilidad.cliente.debito;
var probab_conf_compra = require("../cfg.json").automatico.probabilidad.cliente.confirma;

// ---------

setInterval(mediador.persistir, periodo_persistencia);
setInterval(control.comprar, periodo_comprar);
setInterval(control.comprar, periodo_comprar);

// ---------

bus.on("resultadoFormaEntrega", function (evento) {
  metodoEnvio(evento);

  evento.tarea = "momResultadoFormaEntrega";
  bus.emit(evento.tarea, evento);
});

bus.on("resultadoMedioPago", function (evento) {
  metodoPago(evento);

  evento.tarea = "momResultadoMedioPago";
  bus.emit(evento.tarea, evento);
});

bus.on("resultadoConfirmar", function (evento) {
  confirmar(evento);

  evento.tarea = "momResultadoConfirmar";
  bus.emit(evento.tarea, evento);
});

/*
.............................................................
... pedir publicaciones por unica vez al servidor responsable
.............................................................
*/

var get_publicaciones = {
  "tarea":"momGetPublicaciones",
  "publicaciones" : []
}

bus.emit(get_publicaciones.tarea, get_publicaciones);

/*
.............................................................
... respuestas simuladas
.............................................................
*/

metodoEnvio = function(evento) {
  if(probabilidad() <= probab_envio_correo)
    evento.compra.entrega = evento.compra.entrega_valores[2];  // correo
  else
    evento.compra.entrega = evento.compra.entrega_valores[1];  // retira
}

metodoPago = function(evento) {
  if(probabilidad() <= probab_pago_debito)
    evento.compra.medio = evento.compra.medios[0];  // debito
  else
    evento.compra.medio = evento.compra.medios[1];  // credito
}

confirmar = function(evento) {
  if(probabilidad() <= probab_conf_compra)
    evento.compra.estado = evento.compra.estados[1];  // confirma
  else
    evento.compra.estado = evento.compra.estados[2];  // cancela
}

function probabilidad() {
  return Math.random() * 100;
}
