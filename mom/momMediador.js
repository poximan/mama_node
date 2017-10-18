var publicador = require("./momPublicador");
var bus = require('../eventBus');

/*
.............................................................
... intermediario
.............................................................
*/

// hay que crear carpeta C:\data\db
var MongoClient = require('mongodb').MongoClient;
var mongo_url = require("../cfg.json").mongo.url;

var instancia_db;
var coleccion;

var compras = new Array();
var compra;

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

/*
......... reloj vectorial
*/

exports.indice = function(indice) {
  mi_reloj = indice;
}

exports.incrementar = function(){
  vector[mi_reloj]++;
  console.log("INT: reloj " + mi_reloj + ": " + vector);
}

/*
......... persistencia
*/

exports.coleccion = function(nombre_coleccion) {
  coleccion = nombre_coleccion;
}

/*
......... eventos
*/

bus.on("mom", function (msg) {

  actualizarVector(msg.vector);

  /*
  crea un nuevo array con todos los elementos
  que cumplan la condición implementada por la función dada.
  */
  compras = compras.filter(function(item) {
      return item.id !== msg.evento.id;
  })

  if (!compra){
    compras.push(msg.evento);
  }
  bus.emit(msg.evento.tarea, msg.evento);
});

exports.persistir = function() {
  console.log("persistiendo");
}

exports.publicar = function(reglas_ruteo, evento){

  var msg = {vector, evento};
  publicador.publicar(reglas_ruteo, msg);
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
