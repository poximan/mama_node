/*
param 1 = indice del que es responsable en reloj vectorial
param 2 = coleccion en donde persiten sus documentos este servidor
param 3 = nombre de la cola MOM que escucha este servidor
param 4 = instancia de bus para gestion de eventos
param 5 = lista de suscriptores del servidor dado
param 6 = cantidad de confirmaciones externas para fin corte consistente
param 7 = compras en curso
param 8 = llamada a funcion de persistencia del negocio
*/
module.exports = function(
  mi_reloj,
  coleccion,
  cola_escucha,
  bus,
  suscriptores,
  corte_resp_esperadas,
  compras,
  persistir
) {

  require("./momSuscriptorAdapter")(cola_escucha);
  var publicador = require("./momPublicadorAdapter")();

  var reloj_vectorial = require("./relojVectorial")(mi_reloj);
  var corte_consistente = require("./corteConsistente")(
    bus,
    suscriptores,
    corte_resp_esperadas,
    compras,
    persistir,
    publicador,
    reloj_vectorial
  );

  var module = {};

  /*
  ......... eventos
  */

  bus.on("mom", function (msg) {

    actualizarVector(msg.vector);

    if(msg.evento.tarea !== "momCorte")
      bus.emit("nucleo", msg);
    else {  // llega un mensaje de corte desde otro servidor
      if (!corte_consistente.corte_en_proceso)
        bus.emit(msg.evento.tarea, msg.evento);
    }
    if (corte_consistente.corte_en_proceso)
      corte_consistente.registrar(msg);
  });

  module.publicar = function(suscriptores, evento){

    // si existen destinatarios
    if(suscriptores !== ""){
      var vector = module.vector();
      var msg = {vector, evento};
      publicador.publicar(suscriptores, msg);
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

  function actualizarVector(nuevo_vector){
    reloj_vectorial.actualizarVector(nuevo_vector);
  }

  /*
  ......... corte consistente
  */

  module.sockRespuesta = function(socket) {
    corte_consistente.sockRespuesta(socket);
  }

  module.corteEnProceso = function(){
    return corte_consistente.corte_en_proceso;
  }

  return module;
};
