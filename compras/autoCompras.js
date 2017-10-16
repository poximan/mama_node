/*
este modulo conoce y agrupa distintas funcionalidades que en su conjunto, dan vida al servidor ejecutado

- agrega el control principal del servidor, donde corre el nucleo del negocio.
- pide el mediador que ya fue agregado por el control.
*/

var control = require('./ctrlCompras');
var mediador = control.mediador;

var p_persistencia = require("../cfg.json").automatico.persistencia.periodo;

// ---------

setInterval(mediador.persistir, p_persistencia);

// ---------
