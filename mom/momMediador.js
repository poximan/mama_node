var bus = require('../eventBus');
var _ = require("underscore");
var mongo = require('mongodb');
// hay que crear carpeta C:\data\db

/*
.............................................................
... intermediario
.............................................................
*/

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/tatobd";

var instancia_db;
var coleccion;

var compras = new Array();
var compra;

/*
......... persistencia
*/

exports.coleccion = function(nombre_coleccion) {
  coleccion = nombre_coleccion;

  MongoClient.connect(url, function(err, db) {

    if (err) throw err;
    console.log("conectado a BD");

    instancia_db = db;

    db.createCollection(coleccion, function(err, res) {
      if (err) throw err;
      console.log("coleccion creada");
    });
  });
}

/*
......... eventos
*/

bus.on("mom", function (evento) {

  /*
  crea un nuevo array con todos los elementos
  que cumplan la condición implementada por la función dada.
  */
  compras = compras.filter(function(item) {
      return item.id !== evento.id;
  })

  if (!compra){
    compras.push(evento);
  }

  bus.emit(evento.tarea, evento);
});

exports.persistir = function() {

  instancia_db.collection(coleccion).update(compras);
/*
  instancia_db.collection(coleccion).insertMany(compras, function(err, res) {
    if (err) throw err;
    console.log("se insertaron: " + res.insertedCount + " docs en " + coleccion);
  });
  */
}
