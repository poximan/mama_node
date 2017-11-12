var unificador = require("./unificador");
var _ = require('underscore');

// hay que crear carpeta C:\data\db
var MongoClient = require("mongodb").MongoClient;
var mongo_url = require("./cfg.json").mongo.url;

module.exports = function(
  ind_vector,   // indice del que es responsable en reloj vectorial
  coleccion,    // coleccion en donde persiten sus documentos este servidor
  corte_resp_esperadas, // cantidad de respuetas que espera para fin corte consistente
  cola_escucha, // nombre de la cola en el servidor de mensajeria
  bus           // bus de escucha para los eventos generados por el eventEmitter
){

  var module = {};

  /*
  ......... persistencia
  */

  var db_global;
  MongoClient.connect(mongo_url, function(err, db) {

    if(err)
      throw err;
    db.createCollection(coleccion);
    db_global = db;
  });

  /*
  ......... negocio
  */

  bus.on("nucleo", function (msg) {
    if(msg.evento.tarea !== "momResultadoPublicaciones" &&
          msg.evento.tarea !== "momGetPublicaciones")
      module.agregarCompra(msg.evento);

    bus.emit(msg.evento.tarea, msg.evento);
  });

  var compras = new Array();

  module.compras = function(){
    return compras;
  }

  module.persistir = function() {

    console.log("INT: persistiendo estado");
    var coleccion_obj = db_global.collection(coleccion);

    compras.forEach(function(compra){
      coleccion_obj.update({id:compra.id}, compra, {up:true});
    });
    console.log("INT: estado persistido");
  }

  /*
  param 1 = indice del que es responsable en reloj vectorial
  param 2 = coleccion en donde persiten sus documentos este servidor
  param 3 = cantidad de respuetas que espera para fin corte consistente
  */
  var mw = require("./mom/mw")(
    ind_vector,
    coleccion,
    corte_resp_esperadas,
    cola_escucha,
    module.compras,
    bus,        // bus de escucha para los eventos generados por el eventEmitter
    module.persistir
  );

  // ---------

  module.mw = mw;

  // ---------

  module.actualizarAtributo = function(evento){

    var ev_antiguo = aislarEvento(evento);

    var antigua = ev_antiguo.compra;
    var actualizacion = evento.compra;

    actualizacion = unificador.unificar(antigua, actualizacion);
    evento.compra = actualizacion;
    compras.push(evento);

    return evento;
  }

  function aislarEvento(evento){

    var compra = compras.find(function(item, index, array){
      return item.id == evento.id;
    });

    compras = _(compras).filter(function(item) {
      return item.id != evento.id;
    });

    return compra;
  }

  var canceladas = {confirmacion:0, autorizacion:0, infraccion:0};
  var estadisticas = {totales:0, aceptadas:0, canceladas, en_curso:0};

  module.estadisticas = estadisticas;

  setInterval(function() {
    estadisticas.totales = compras.length;
    estadisticas.aceptadas = 0;

    estadisticas.canceladas.confirmacion = 0;
    estadisticas.canceladas.autorizacion = 0;
    estadisticas.canceladas.infraccion = 0;

    var tot_canceladas = 0;
    compras.forEach(function(evento){

      // compras aceptadas
      if(evento.compra.estado === evento.compra.estado_valores[3])
        estadisticas.aceptadas++;

      // si todavia no esta aceptada
      if(evento.compra.estado !== evento.compra.estado_valores[3]){
        if(evento.compra.estado === evento.compra.estado_valores[2])
          estadisticas.canceladas.confirmacion++;
        if(evento.compra.pago === evento.compra.pago_valores[2])
          estadisticas.canceladas.autorizacion++;
        if(evento.compra.infracciones === evento.compra.infracciones_valores[2])
          estadisticas.canceladas.infraccion++;
      }
      tot_canceladas = estadisticas.canceladas.confirmacion + estadisticas.canceladas.autorizacion + estadisticas.canceladas.infraccion;
    });
    estadisticas.en_curso = estadisticas.totales - estadisticas.aceptadas - tot_canceladas;

  }, 1000);

  /*
  solo agrega la compra en caso que no exista. no realiza ningun analisis de versiones
  si la compra existe, no la agrega
  */
  module.agregarCompra = function(evento){
    if(!compras.some(x => x.id === evento.id))
      compras.push(evento);
  }

  module.sumar = function(estado_sincro, indice_objetivo, incremento){

    while(estado_sincro.length <= indice_objetivo)
      estado_sincro.push(0);

    estado_sincro[indice_objetivo] += incremento;
  }

  return module;
}