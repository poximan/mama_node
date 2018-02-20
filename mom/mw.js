/*
param 1 = indice del que es responsable en reloj vectorial
param 2 = coleccion en donde persiten sus documentos este servidor
param 3 = nombre de la cola MOM que escucha este servidor
param 4 = instancia de bus para gestion de eventos
param 5 = lista de suscriptores del servidor dado
param 6 = cantidad de confirmaciones externas para fin corte consistente
param 7 = estado actual del servidor. son los valores en memoria dinamica
param 8 = llamada a funcion de persistencia del negocio
*/
module.exports = function(
  mi_reloj,
  coleccion,
  cola_escucha,
  bus,
  suscriptores,
  corte_resp_esperadas,
  estado_servidor,
  persistir
) {

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

  try {
    var corte_consistente = require("consistencia-cc/corteConsistente")(
      bus,
      suscriptores,
      corte_resp_esperadas,
      estado_servidor,
      persistir,
      instMOM,
      reloj_vectorial
    );
    console.log("INT: inicializando MW con modulo de corte consistente");
  } catch (e) {
    console.log("INT: inicializando MW sin modulo de corte consistente");
  } finally {

  }

  var module = {};

  /*
  ......... eventos
  */

  bus.on("mom", function (msg) {

    reloj_vectorial.actualizarVector(msg.vector);

    if(msg.evento.tarea !== "momCorte")
      bus.emit("nucleo", msg);
    else {  // llega un mensaje de corte desde otro servidor
      try {
        if (!corte_consistente.corte_en_proceso)
          bus.emit(msg.evento.tarea, msg.evento);
      } catch (e) { } finally { }
    }
    try {
      if (corte_consistente.corte_en_proceso)
        corte_consistente.registrar(msg);
    } catch (e) { } finally { }
  });

  module.publicar = function(suscriptores, evento){

    // si existen destinatarios
    if(suscriptores !== ""){
      var vector = module.vector();
      var msg = {vector, evento};
      instMOM.publicar(suscriptores, msg);
    }
  }

  /*
  ......... reloj vectorial
  */

  module.incrementar = function(){
    reloj_vectorial.incrementar();
  }

  module.indice = function(){
    return reloj_vectorial.indice();
  }

  module.vector = function(){
    return reloj_vectorial.vector();
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

  return module;
};
