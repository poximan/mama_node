var shell_ejec = require('./shell_con_cb')
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
    console.log("Levantando DBMS mongo");

    // 3.0 pc trabajo o 3.4 pc casa y note
    var version_mongo = "3.4";
    // servidor base de datos (hay que crear carpeta C:\data\db)

    shell_ejec.execCommand("start ventana /K \"c:\ && cd Program Files && cd MongoDB && cd Server && cd " + version_mongo +  " && cd bin && mongod.exe\"", function (returnvalue) {
      callback(returnvalue);
    });
  },
  function(callback) {

    console.log("Conectando a base de datos");
    var id = setInterval(function(){
      MongoClient.connect(mongo_url, function(err, db) {

        if(db !== null){
          clearInterval(id);

          if(instancia_bd == "nueva"){
            console.log("Limpiando colecciones en base de datos");
            db.dropDatabase();
          }

          if(instancia_bd == "actual"){
            console.log("Se continua desde ultimo estado de base de datos");
          }
          process.exit(1);
        }
      });
    }, 500);
    callback(null);
  }
];

async.waterfall(operaciones, function (err, evento) {
});
