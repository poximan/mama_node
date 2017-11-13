var shell_ejec = require('./shell')
var async = require('async');
var MongoClient = require('mongodb').MongoClient;
var mongo_url = require("../cfg.json").mongo.url;

// ---------

var instancia_bd = process.argv.slice(2);

if (instancia_bd.length == 0 ||
  (instancia_bd != "nueva" && instancia_bd != "actual")) {

  console.log("Usar: levantar_bd.js {nueva|actual}");
  process.exit(1);
}

// ---------

var operaciones = [
  function(callback) {
    console.log("levantando bd");

    // 3.0 pc trabajo o 3.4 pc casa y note
    var version_mongo = "3.4";
    // servidor base de datos (hay que crear carpeta C:\data\db)
    shell_ejec("start ventana /K \"c:\ && cd Program Files && cd MongoDB && cd Server && cd " + version_mongo +  " && cd bin && mongod.exe\"");

    setTimeout(function() { callback(null); }, 2000);
  },
  function(callback) {

    if(instancia_bd == "nueva"){

      console.log("limpiando base de datos");
      MongoClient.connect(mongo_url, function(err, db) {
        db.dropDatabase();
        setTimeout(function() { process.exit(1); }, 1000);
      });
    }
    if(instancia_bd == "actual"){
      console.log("usando base de datos actual");
    }

    callback(null);
  }
];

async.waterfall(operaciones, function (err, evento) {
  console.log("todos los servidores activos");
});
