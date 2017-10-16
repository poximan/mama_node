/*
este modulo conoce y agrupa distintas funcionalidades que en su conjunto, dan vida al servidor ejecutado

- agrega el control principal del servidor, donde corre el nucleo del negocio.
- pide el mediador que ya fue agregado por el control.
- pide el bus de mensajes (eventEmitter) que ya fue agregado por el control.
- delega en un experto la toma de decisiones, basado en probabilidades
*/

var control = require('./ctrlPublicaciones');
var mediador = control.mediador;

require('./expertoSim');

var p_persistencia = require("../cfg.json").automatico.persistencia.periodo;

// ---------

setInterval(mediador.persistir, p_persistencia);

// ---------
