var publicador = require("./momPublicador");
var bus = require('../eventBus');
var _ = require('underscore');
var unificador = require("./unificador");

/*
.............................................................
... intermediario
.............................................................
*/

// hay que crear carpeta C:\data\db
var MongoClient = require("mongodb").MongoClient;
var mongo_url = require("../cfg.json").mongo.url;

var instancia_db;
var instancia_colecc;

/*
......... reloj vectorial
*/

/*
0=serv_compras
1=serv_envios
2=serv_infracciones
3=serv_pagos
4=serv_publicaciones
5=serv_web
*/
var vector = [0, 0, 0, 0, 0, 0];
var mi_reloj = 0;

exports.indice = function(indice) {
  mi_reloj = indice;
}

exports.incrementar = function(){

  vector[mi_reloj]++;
  console.log("INT: reloj " + mi_reloj + ": " + vector);
}

function actualizarVector(nuevo_vector){

  var aux_reloj = vector[mi_reloj];

  for (var i = 0; i < vector.length; i++) {
    if(vector[i] < nuevo_vector[i])
      vector[i] = nuevo_vector[i];
  }
  if(aux_reloj < vector[mi_reloj])
    console.error("error en reloj vectorial");
}

/*
......... persistencia
*/

exports.coleccion = function(nombre_coleccion) {

  instancia_colecc = nombre_coleccion;

  MongoClient.connect(mongo_url, function(err, db) {
    instancia_db = db;

    if(err)
      throw err;
    db.createCollection(nombre_coleccion);
  });
}

function persistir() {

  console.log("INT: persistiendo estado");
  var coleccion = instancia_db.collection(instancia_colecc);

  compras.forEach(function(compra){
    coleccion.update({id:compra.id}, compra, {up:true});
  });
} exports.persistir = persistir;

/*
......... eventos
*/

bus.on("mom", function (msg) {

  actualizarVector(msg.vector);

  if(msg.evento.tarea !== "momResultadoPublicaciones" &&
    msg.evento.tarea !== "momGetPublicaciones" &&
    msg.evento.tarea !== "momCorte")

    agregarCompra(msg.evento);

  /*
  si no se está ejecutando un corte consistente, el mensaje que llega
  desde el canal de comunicaciones se pasa a la capa de negocio

  nota: como caso singular, si no esta ejecutando un corte consistente pero
  este mensaje es el inicio de uno, cuando se coloque en el bus no será
  atrapado por el negocio, sino por un escucha en el mediador que inicaria
  el corte consistente...

  "bus.on("momCorte", function (evento) {});"

  */
  if (typeof registrarActividad !== "function"){
    bus.emit(msg.evento.tarea, msg.evento);
  }
  if (typeof registrarActividad === "function"){
    /*
    si se esta ejecutando un corte consistente, el mensaje no se baja al negocio
    sino que se encola
    */
    registrarActividad("entrante", msg);
  }
});

function publicar(reglas_ruteo, evento){

  var msg = {vector, evento};

  if (typeof registrarActividad !== "function" ||
      evento.tarea === "momCorte")
    publicador.publicar(reglas_ruteo, msg);
  else {
    registrarActividad("saliente", msg);
  }
} exports.publicar = publicar;

/*
......... corte consistente
*/

exports.corteEnProceso = function() {
  return typeof registrarActividad === "function";
}

/*
numero de respuestas que espera el servidor
antes de confirmar el fin del algoritmo corte consistente
*/
var corte_resp_esperadas, corte_resp_recibidas = 0;
exports.respuestasCorte = function(cant_serv) {
  corte_resp_esperadas = cant_serv;
}

var registrarActividad = "no funcion";
var canal_entrante, canal_saliente;
exports.registroCorte = function(arreglo) {
  canal_entrante = arreglo;
  canal_saliente = arreglo.slice(0);
}

bus.on("momCorte", function (evento) {

  console.log("ENT: procesando pedido corte consistente");
  persistir();

  console.log("INT: ocultando canales de E/S del negocio");
  registrarActividad = funcionRegistrar;

  switch(instancia_colecc) {
    case "colecc_compras":
        publicar("envios.infracciones.pagos.publicaciones.web", evento);
        break;
    case "colecc_envios":
    case "colecc_infracciones":
    case "colecc_pagos":
        publicar("compras.publicaciones", evento);
        break;
    case "colecc_web":
        publicar("compras", evento);
        break;
    case "colecc_publicaciones":
        break;
    default:
  }
});

function funcionRegistrar(origen, msg){

  if(origen === "entrante"){

    if(msg.evento.tarea === "momCorte")
      corte_resp_recibidas++;

    canal_entrante.push(msg);
  }

  if(origen === "saliente")
    canal_saliente.push(msg);

  if (corte_resp_recibidas === corte_resp_esperadas){

    var msg = {ent:canal_entrante.slice(0), est:compras.slice(0), sal:canal_saliente.slice(0)};

    console.log("mensajes entrantes -->");
    canal_entrante.forEach(function(actual){

      var texto;

      if(actual.evento.tarea === "momCorte")
        texto = actual;
      else {
        texto = "compra " + actual.evento.id + " => " +
        actual.evento.compra.estado + " : " +
        actual.evento.compra.entrega + " : " +
        actual.evento.compra.reserva + " : " +
        actual.evento.compra.pago + " : " +
        actual.evento.compra.infracciones + " : " +
        actual.evento.compra.medio;
      }

      console.log(texto);
    });

    console.log("en memoria -->");
    compras.forEach(function(actual){

      var texto = "compra " + actual.id + " => " +
      actual.compra.estado + " : " +
      actual.compra.entrega + " : " +
      actual.compra.reserva + " : " +
      actual.compra.pago + " : " +
      actual.compra.infracciones + " : " +
      actual.compra.medio;

      console.log(texto);
    });

    console.log("mensajes saliente -->");
    console.log(canal_saliente);

    registrarActividad = "no funcion";
    corte_resp_recibidas = 0;
    canal_entrante.length = 0;
    canal_saliente.length = 0;

    console.log("INT: fin corte consistente");
    sock_respuesta.emit("resCorte", msg);
  }
}

/*
......... negocio (instancias de compras)
*/

var sock_respuesta;
exports.sockRespuesta = function(socket) {
  sock_respuesta = socket;
}

var compras;
exports.registroCompras = function(arreglo) {
  compras = arreglo;
}
exports.totales = function(){
    return compras;
}

var estadisticas = { totales:0, aceptadas:0, canceladas:0, en_curso:0,};
exports.estadisticas = estadisticas;

setInterval(function() {
  estadisticas.totales = compras.length;
  estadisticas.aceptadas = estadisticas.canceladas = 0;

  compras.forEach(function(evento){

    if(evento.compra.estado === evento.compra.estado_valores[3])
      estadisticas.aceptadas++;
    if(evento.compra.estado === evento.compra.estado_valores[2])
      estadisticas.canceladas++;
    estadisticas.en_curso = estadisticas.totales - estadisticas.aceptadas - estadisticas.canceladas;
  });
}, 1000);

exports.actualizarAtributo = function(evento){

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

/*
solo agrega la compra en caso que no exista. no realiza ningun analisis de versiones
*/
function agregarCompra(evento){
  if(!compras.some(x => x.id === evento.id))
    compras.push(evento);
}
