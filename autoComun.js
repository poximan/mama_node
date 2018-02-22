/*
param 1 = nucleo del negocio para cada servidor. todos los servidores poseen algo de logica de
negocio comun, que es indistinta del servidor que se trate
param 2 = bus de mensajes, mensajes internos.
*/
module.exports = function(
  nucleo,
  bus
){

  var module = {};

  var periodo_persistencia = require("./propiedades.json").automatico.persistencia.periodo;
  var periodo_caida = require("./propiedades.json").automatico.caida_servidor.periodo;

  var probab_corte_consistente = require("./propiedades.json").probabilidad.corte_consistente;
  var probab_caida = require("./propiedades.json").automatico.probabilidad.caida_servidor;

  // ---------

  setInterval(persistir, periodo_persistencia);

  setInterval(function(){
    if(probabilidad() <= probab_caida)
      nucleo.caida();
  }, periodo_caida);

  /*
  al persistirse el estado, solicita con un 50% de probabilidad la
  generación de un corte consistente
  */
  function persistir() {

    if(probabilidad() <= probab_corte_consistente)
      nucleo.mw.iniciarCorte();
    else
      nucleo.persistir();
  }

  function probabilidad() {
    return Math.random() * 100;
  }

  return module;
}
