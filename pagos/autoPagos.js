var port = require("../globalCfg.json").monitor.port_pagos;
var control = require('./ctrlPagos');
var monitor = require('../monitorServ')(port, control.nucleo, control.bus);

var bus = control.bus;
var io = monitor.io;

require("../autoComun")(control.nucleo, bus);

var probab_autorizacion = require("./localCfg.json").automatico.probab_autorizacion;

// ---------

bus.on("resultadoAutorizacion", function (evento) {
  autorizar(evento);

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

/*
.............................................................
... respuestas desde cliente web
.............................................................
*/

io.on('connection', function (socket) {
  monitor.agendarEventos("auto");
});
