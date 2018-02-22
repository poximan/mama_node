var port = require("../propiedades.json").monitor.port_web;
var control = require('./ctrlWeb');
var monitor = require('../monitorServ')(port, control.nucleo, control.bus);

var bus = control.bus;
var io = monitor.io;

require("../autoComun")(control.nucleo, bus);

var periodo_comprar = require("./propiedades.json").automatico.nueva_compra.periodo;
var max_compras = require("./propiedades.json").automatico.total_compras.cantidad;

var probab_envio_correo = require("./propiedades.json").automatico.probab_envio_correo;
var probab_pago_debito = require("./propiedades.json").automatico.probab_pago_debito;
var probab_conf_compra = require("./propiedades.json").automatico.probab_conf_compra;

// ---------

var cant_compras = 1;
var id = setInterval(function(){

  if(control.hayPublicaciones()){
    control.comprar();
    if(max_compras != 0 && cant_compras++ >= max_compras)
      clearInterval(id);
  }
}, periodo_comprar);

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
  "id": 1,
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
    evento.compra.estado = evento.compra.estado_valores[1];  // confirma
  else
    evento.compra.estado = evento.compra.estado_valores[2];  // cancela
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
