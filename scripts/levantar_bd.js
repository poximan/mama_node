var shell_ejec = require('./shell_con_cb')
var async = require('async');
var MongoClient = require('mongodb').MongoClient;
var mongo_prot = require("../cfg.json").mongo.protocolo;
var mongo_serv = require("../cfg.json").mongo.servidor;
var mongo_bd = require("../cfg.json").mongo.bd;

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

    function probarConexion(arg) {

      var arq64x = "";//" (x86)";
      shell_ejec.execCommand("start ventana /C c:/\"Program Files" +
                                                  arq64x+"\""+
                                                  "/\"Mozilla Firefox\"/firefox " +
                                                  mongo_serv, function (returnvalue) {
                                                    callback(null, "Probando conexion con DBMS")
                                                  });
    }
    setTimeout(probarConexion, 2000);
  },
  function(callback){

    var url = mongo_prot + mongo_serv;
    MongoClient.connect(url, function(err, db) {

      if (err) throw err;
      var dbase = db.db(mongo_bd);

      callback(dbase, "Conectado a BD");
    });
  },
  function(dbase, callback){

    var mensaje = "";

    if(instancia_bd == "nueva"){
      mensaje = "Limpiando colecciones";
      dbase.dropDatabase();
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

/*
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
}, 1000);
*/
