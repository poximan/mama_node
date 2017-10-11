var shell_ejec = require('./shell')
var async = require('async');

var modo_operacion = process.argv.slice(2);

var operaciones = [
  function(callback) {
    console.log("levantando bd");

    var version_mongo = "3.0";
    // servidor base de datos (hay que crear carpeta C:\data\db)
    shell_ejec("start ventana /K \"c:\ && cd Program Files && cd MongoDB && cd Server && cd " + version_mongo +  " && cd bin && mongod.exe\"");

    callback(null);
  },
  function(callback) {
    callback(null);
  }
];
async.waterfall(operaciones, function (err, evento) {
  console.log("todos los servidores activos");
});
