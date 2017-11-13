var port = require("../cfg.json").monitor.port_publicaciones;
var control = require('./ctrlPublicaciones');
var monitor = require('../monitorServ')(port, control.nucleo, control.bus);

var mw = control.nucleo.mw;
var bus = control.bus;
var io = monitor.io;

var periodo_persistencia = require("../cfg.json").automatico.persistencia.periodo;
var periodo_caida = require("../cfg.json").automatico.caida_servidor.periodo;

var probab_corte_consistente = require("../cfg.json").probabilidad.corte_consistente;
var probab_caida = require("../cfg.json").automatico.probabilidad.caida_servidor;

// ---------

setInterval(persistir, periodo_persistencia);

setInterval(function(){
  if(probabilidad() <= probab_caida)
    control.nucleo.caida();
}, periodo_caida);

// ---------

bus.on("resultadoStock", function (publicacion) {
  publicacion.cantidad = cantidad();
});

/*
.............................................................
... respuestas simuladas
.............................................................
*/

cantidad = function() {
  return Math.ceil(probabilidad()/10);
}

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
