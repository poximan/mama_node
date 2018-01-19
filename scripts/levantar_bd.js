var shell_ejec = require('./shell_con_cb')
var async = require('async');
var MongoClient = require('mongodb').MongoClient;
var mongo_url = require("../cfg.json").mongo.url;

var fs = require("fs"),
    path = require("path");

// ---------

var instancia_bd = process.argv.slice(2);

if (instancia_bd.length == 0 ||
  (instancia_bd != "nueva" && instancia_bd != "actual")) {

  console.log("Usar: levantar_bd.js {nueva|actual}");
  process.exit(1);
}

// ---------

var version_mongo = [];
var base_datos;

async.series([
  function(callback){

    var p = "c:/Program Files/MongoDB/Server/";

    fs.readdir(p, function (err, files) {
      if (err) {
          throw err;
      }
      files.map(function (file) {
          return path.join(p, file);
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
    shell_ejec.execCommand("start ventana /K \"c:\ && cd Program Files && cd MongoDB && cd Server && cd " +
                                                  version_mongo +
                                                  " && cd bin && mongod.exe\"", function (returnvalue) {
                                                    callback(null, "Proceso mongod.exe activo")
                                                  });
  },
  function(callback){

    MongoClient.connect(mongo_url, function(err, db) {

      base_datos = db;
      callback(null, "Conectado a BD");
    });
  },
  function(callback){

    var mensaje = "";

    var id = setInterval(function(){

      if(base_datos !== null){
        clearInterval(id);

        if(instancia_bd == "nueva"){
          mensaje = "Limpiando colecciones";
          base_datos.dropDatabase();
        }
        if(instancia_bd == "actual"){
          mensaje = "Usando ultimo estado de colecciones";
        }
        callback(null, mensaje);
      }
    }, 500);
  }
],
// optional callback
function(err, results) {
  console.log(results);
  process.exit(0);
});
