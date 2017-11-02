var port = require("../cfg.json").monitor.port_web;
var control = require('./ctrlWeb');
var monitor = require('../monitorServ')(port, control);

var mediador = control.mediador;
var bus = control.bus;
var io = monitor.io;

var periodo_persistencia = require("../cfg.json").automatico.persistencia.periodo;
var periodo_comprar = require("../cfg.json").automatico.nueva_compra.periodo;
var probab_envio_correo = require("../cfg.json").automatico.probabilidad.cliente.correo;
var probab_pago_debito = require("../cfg.json").automatico.probabilidad.cliente.debito;
var probab_conf_compra = require("../cfg.json").automatico.probabilidad.cliente.confirma;
var probab_corte_consistente = require("../cfg.json").probab_corte_consistente;

// ---------

setInterval(persistir, periodo_persistencia);
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
    evento.compra.estado = evento.compra.estado_valores[1];  // confirma
  else
    evento.compra.estado = evento.compra.estado_valores[2];  // cancela
}

/*
al persistirse el estado, solicita con un 50% de probabilidad la
generación de un corte consistente
*/
function persistir(evento) {

  if(!mediador.corteEnProceso())
    if(probabilidad() <= probab_corte_consistente){

      var tarea = "momCorte";
      var evento = {tarea};

      console.log("GLOBAL: comienza corte consistente");
      bus.emit(evento.tarea, evento);
    }
    else {
      mediador.persistir();
    }
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
