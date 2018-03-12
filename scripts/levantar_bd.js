var shell = require('./shell')
var terminal = require("./propiedades.json").shell.terminal;
var path_mongo = require("./propiedades.json").server_mongo.path;

var async = require('async');
var demora = require("./demora")();

var MongoClient = require('mongodb').MongoClient;
var mongo_prot = require("../propiedades.json").mongo.protocolo;
var mongo_serv = require("../propiedades.json").mongo.servidor;
var mongo_bd = require("../propiedades.json").mongo.bd;

var fs = require("fs"),
    path = require("path");

// ---------

var instancia_bd = process.argv.slice(2);
var dbase_global;

if (instancia_bd.length == 0 ||
  (instancia_bd[0] != "nueva" && instancia_bd[0] != "actual")) {

  console.log("Usar: levantar_bd.js {nueva|actual}");
  process.exit(1);
}

// ---------

var version_mongo = [];

async.series([
  function(callback){

    fs.readdir(path_mongo, function (err, files) {
      if (err) {
          throw err;
      }
      files.map(function (file) {
          return path.join(path_mongo, file);
      }).filter(function (file) {
          return fs.statSync(file).isDirectory();
      }).forEach(function (file) {
        version_mongo.push(file.slice(file.lastIndexOf("\\") + 1, file.length));
      });
      callback(null, "Version mongo localizada");
    });
  },
  function(callback){

    version_mongo = version_mongo[version_mongo.length - 1];
    // servidor base de datos (hay que crear carpeta C:\data\db)
    
    shell.execCommand("start " + terminal + " /K \"c: && cd \"" +  path_mongo + "\" && cd " +
                            version_mongo + " && cd bin && mongod.exe\"", function (returnvalue) {});

                            demora.esperar(3000);
                            callback(null, "Proceso mongod.exe activo")
  },
  function(callback){

    var url = mongo_prot + mongo_serv;
    MongoClient.connect(url, function(err, db) {

      if (err) throw err;
      var dbase = db.db(mongo_bd);
      dbase_global = dbase;

      callback(null, "Conectado a BD");
    });
  },
  function(callback){

    var mensaje = "";

    if(instancia_bd == "nueva"){
      mensaje = "Limpiando colecciones";
      dbase_global.dropDatabase();
    }
    if(instancia_bd == "actual"){
      mensaje = "Usando ultimo estado de colecciones";
    }
    callback(null, mensaje);
  }
],
// optional callback
function(err, results) {
  console.log(results);
  process.exit(0);
});
