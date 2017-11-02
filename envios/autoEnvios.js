var port = require("../cfg.json").monitor.port_envios;
var control = require('./ctrlEnvios');
var monitor = require('../monitorServ')(port, control);

var mediador = control.mediador;
var bus = control.bus;
var io = monitor.io;

var periodo_persistencia = require("../cfg.json").automatico.persistencia.periodo;
var probab_corte_consistente = require("../cfg.json").probab_corte_consistente;

// ---------

setInterval(persistir, periodo_persistencia);

// ---------

bus.on("resultadoCosto", function (evento) {
  costo(evento);

  evento.tarea = "momResultadoCosto";
  bus.emit(evento.tarea, evento);
});

/*
.............................................................
... respuestas simuladas
.............................................................
*/

costo = function(evento) {
  evento.compra.adic_envio = Math.ceil(probabilidad());
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
