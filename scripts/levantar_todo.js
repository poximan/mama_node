var shell = require('./shell')
var terminal = require("./propiedades.json").shell.terminal;
var async = require('async');
var demora = require("./demora")();

if (process.argv.length != 4) {

  console.log("\nUsar: levantar_todo.js {nueva|actual} {auto|man}");
  console.log("--------------------------------------------------");
  console.log("{nueva|actual} para definir la instancia de base de datos");
  console.log("{auto|man} para definir el modo de ejecucion de los servidores");
  process.exit(1);
}

var argumentos = process.argv.slice(2);

async.series([
  function(callback) {

    shell.execCommand("start " + terminal + " /K \"node levantar_bd.js\" " +
      argumentos[0], function (returnvalue) {
      });

    demora.esperar(5000);
    callback(null, "Activando SGBD");
  },
  function(callback) {

    shell.execCommand("start " + terminal + " /K \"node levantar_serv.js \"" +
      argumentos[1], function (returnvalue) {

        callback(null, "Activando Servidores");
      });
  }
],
// optional callback
function(err, results) {
  console.log(results);
  process.exit(0);
});
