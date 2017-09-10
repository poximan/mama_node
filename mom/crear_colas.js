var shell_ejec = require('../shell')
var async = require('async');

var operaciones = [
  function(callback) {

    console.log("creando colas");

    shell_ejec("node crear_cola.js web");
    shell_ejec("node crear_cola.js compras");
    shell_ejec("node crear_cola.js infracciones");
    shell_ejec("node crear_cola.js publicaciones");
    shell_ejec("node crear_cola.js envios");
    shell_ejec("node crear_cola.js pagos");

    console.log("todas las colas creadas\n");
    callback(null);
  },
  function(callback) {
    callback(null);
  }
];

async.waterfall(operaciones, function (err, evento) {
});
