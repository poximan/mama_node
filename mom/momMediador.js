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

exports.persistir = function() {

  console.log("INT: persistiendo estado");
  var coleccion = instancia_db.collection(instancia_colecc);

  compras.forEach(function(compra){
    coleccion.update({id:compra.id}, compra, {upsert:true});
  });
}

/*
......... eventos
*/

bus.on("mom", function (msg) {

  actualizarVector(msg.vector);

  if(msg.evento.tarea !== "momResultadoPublicaciones" &&
    msg.evento.tarea !== "momGetPublicaciones")

    agregarCompra(msg.evento);


  bus.emit(msg.evento.tarea, msg.evento);
});

exports.publicar = function(reglas_ruteo, evento){

  var msg = {vector, evento};
  publicador.publicar(reglas_ruteo, msg);
}

/*
......... negocio (instancias de compras)
*/

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
}, 4000);

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
