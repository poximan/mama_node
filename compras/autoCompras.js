var port = require("../cfg.json").monitor.port_compras;
var control = require('./ctrlCompras');
var monitor = require('../monitorServ')(port, control.nucleo, control.bus);

var mw = control.mw;
var bus = control.bus;
var io = monitor.io;

var periodo_persistencia = require("../cfg.json").automatico.persistencia.periodo;
var probab_corte_consistente = require("../cfg.json").probabilidad.corte_consistente;

// ---------

setInterval(persistir, periodo_persistencia);

// ---------

/*
.............................................................
... respuestas simuladas
.............................................................
*/

/*
al persistirse el estado, solicita con un 50% de probabilidad la
generación de un corte consistente
*/
function persistir(evento) {

  if(!mw.corteEnProceso())
    if(probabilidad() <= probab_corte_consistente){

      var tarea = "momCorte";
      var evento = {tarea};

      console.log("GLOBAL: comienza corte consistente");
      bus.emit(evento.tarea, evento);
    }
    else {
      control.nucleo.persistir();
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
