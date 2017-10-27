var publicador = require("./momPublicador");
var bus = require('../eventBus');
var _ = require('underscore');

/*
.............................................................
... intermediario
.............................................................
*/

// hay que crear carpeta C:\data\db
var MongoClient = require('mongodb').MongoClient;
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

      actualizarMensaje(msg.evento);

  bus.emit(msg.evento.tarea, msg.evento);
});

exports.publicar = function(reglas_ruteo, evento){

  var msg = {vector, evento};
  publicador.publicar(reglas_ruteo, msg);
}

/*
......... negocio (instancias de compras)
*/

var compras = new Array();
exports.totales = compras;

var estadisticas = { totales:0, aceptadas:0, canceladas:0, en_curso:0,};
exports.estadisticas = estadisticas;

setInterval ( function() {
  estadisticas.totales = compras.length;

  compras.forEach(function(evento){
    if(evento.compra.estado === evento.compra.estados[3])
      estadisticas.aceptadas++;
    if(evento.compra.estado === evento.compra.estados[2])
      estadisticas.canceladas++;
    estadisticas.en_curso = estadisticas.totales - estadisticas.aceptadas - estadisticas.canceladas;
  });
}, 4000);

function actualizarMensaje(evento){

  var coincidencia = buscarEvento(evento);
  if(coincidencia !== undefined)
    evento = merge(evento, coincidencia);

  compras.push(evento);
}

function buscarEvento(evento){

  var compra = compras.find(function(element, index, array){
    return element.id == evento.id;
  });

  if(compra)
    compras = _(compras).filter(function(item) {
      return item.id != evento.id;
    });

  return compra;
}

function merge(actualizacion, anterior){

  if(actualizacion.compra.estado === "")
    actualizacion.compra.estado = anterior.compra.estado;

  if(actualizacion.compra.entrega === "")
    actualizacion.compra.entrega = anterior.compra.entrega;

  if(actualizacion.compra.reserva === "")
    actualizacion.compra.reserva = anterior.compra.reserva;

  if(actualizacion.compra.pago === "")
    actualizacion.compra.pago = anterior.compra.pago;

  if(actualizacion.compra.infracciones === "")
    actualizacion.compra.infracciones = anterior.compra.infracciones;

  if(actualizacion.compra.medio === "")
    actualizacion.compra.medio = anterior.compra.medio;

  return actualizacion;
}
