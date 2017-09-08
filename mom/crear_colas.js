var shell_ejec = require('../shell')
var async = require('async');

var operaciones = [
  function(callback) {

    console.log("creando cola compras");
    shell_ejec("node crear_cola.js compras");

    console.log("creando cola infracciones");
    shell_ejec("node crear_cola.js infracciones");

    console.log("creando cola web");
    shell_ejec("node crear_cola.js web");

    console.log("creando cola publicaciones");
    shell_ejec("node crear_cola.js publicaciones");

    console.log("creando cola envios");
    shell_ejec("node crear_cola.js envios");
    //shell_ejec("node crear_cola.js pagos");

    console.log("todas las colas creadas\n");
    callback(null);
  },
  function(callback) {
    callback(null);
  }
];
async.waterfall(operaciones, function (err, evento) {
  console.log("colas creadas");
});
