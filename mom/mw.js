/*
param 1 = indice del que es responsable en reloj vectorial
param 2 = nombre de la cola MOM que escucha este servidor
param 3 = instancia de bus para gestion de eventos
param 4 = lista de suscriptores del servidor dado
param 5 = cantidad de confirmaciones externas para fin corte consistente
param 6 = estado actual del servidor. son los valores en memoria dinamica
param 7 = llamada a funcion de persistencia del negocio
*/
module.exports = function(
  mi_reloj,
  cola_escucha,
  bus,
  suscriptores,
  corte_resp_esperadas,
  estado_servidor,
  persistir
) {

  var module = {};

  var estrategia = require("../globalCfg.json").amqp.proveedor;

  const Config = require('./config');
  const strategies = require('./strategies');

  for (item in strategies)
    if(item.toString() == estrategia)
      estrategia = item;

  const instMOM = new Config(strategies[estrategia]);
  try{
    instMOM.altaSuscriptor(cola_escucha);
    instMOM.altaPublicador();
  } catch(e){
    console.error("INT: debe declarar un proovedor de mensajeria valido en globalCfg.json y definir sus instancias pub/sus concretas");
    process.exit(1);
  } finally { }

  var reloj_vectorial = require("consistencia-rv/relojVectorial")(mi_reloj);

  module.publicar = function(suscriptores, evento){

    // si existen destinatarios
    if(suscriptores !== ""){
      var vector = module.vector();
      var msg = {vector, mw:"negocio", evento};
      instMOM.publicar(suscriptores, msg);
    }
  }

  module.publicarMW = function(){

    // si existen destinatarios
    if(suscriptores !== ""){
      var vector = module.vector();
      var msg = {vector, mw:"momCorte"};
      instMOM.publicar(suscriptores, msg);
    }
  }

  try {
    var corte_consistente = require("consistencia-cc/corteConsistente")(
      bus,
      corte_resp_esperadas,
      estado_servidor,
      persistir,
      module.publicarMW
    );
    console.log("INT: inicializando MW con modulo de corte consistente");
  } catch (e) {
    console.log("INT: inicializando MW sin modulo de corte consistente");
  } finally {

  }

  bus.on("mom", function (msg) {

    reloj_vectorial.actualizarVector(msg.vector);

    if(msg.mw == "negocio")
      bus.emit(msg.mw, msg.evento);

    if(msg.mw == "momCorte")
      module.iniciarCorte();
      
    /* si hay corte en proceso...
    se debe registar toda actividad del canal de entrada
    */
    try {
      if (module.corteEnProceso())
        corte_consistente.registrar(msg);
    } catch (e) { } finally { }
  });

  /*
  ......... reloj vectorial
  */

  module.vector = function(){
    return reloj_vectorial.vector();
  }

  module.incrementar = function(){
    reloj_vectorial.incrementar();
  }

  module.indice = function(){
    return reloj_vectorial.indice();
  }

  /*
  ......... corte consistente
  */

  module.existeModuloCC = function() {
    return corte_consistente !== undefined;
  }

  module.sockRespuesta = function(socket) {
    try {
      corte_consistente.sockRespuesta(socket);
    } catch (e) {} finally {}
  }

  module.corteEnProceso = function(){
    try {
      return corte_consistente.corte_en_proceso;
    } catch (e) {
      return false;
    } finally {}
  }

  /*
  estas solicitudes pueden entrar desde el modo automatico en forma periodica y probabalista,
  o desde el monitor cuando el sistema funciona en manual y el usuario lo solicita
  */
  module.iniciarCorte = function(){

    if(module.existeModuloCC() && !module.corteEnProceso())
      corte_consistente.iniciarCorte();
  }

  return module;
};
