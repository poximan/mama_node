var shell_ejec = require('./shell')
var async = require('async');

var modo_operacion = process.argv.slice(2);

if (modo_operacion.length == 0) {
  console.log("Usar: levantar_serv.js {man|auto}");
  process.exit(1);
}

var operaciones = [
  function(callback) {

    console.log("levantando servidores");

    // servidores negocio
    shell_ejec("start ventana /K \"cd compras && node \"" + modo_operacion + "\"Compras.js\"");
    shell_ejec("start ventana /K \"cd envios && node \"" + modo_operacion + "\"Envios.js\"");
    shell_ejec("start ventana /K \"cd infracciones && node \"" + modo_operacion + "\"Infracciones.js\"");
    shell_ejec("start ventana /K \"cd pagos && node \"" + modo_operacion + "\"Pagos.js\"")
    shell_ejec("start ventana /K \"cd publicaciones && node \"" + modo_operacion + "\"Publicaciones.js\"");
    shell_ejec("start ventana /K \"cd web && node \"" + modo_operacion + "\"Web.js\"");

    callback(null);
  },
  /*
  esta funcion agrega un tiempo de espera entre levantar todos los servidores
  del negocio y el monitor, tal que cuando este se active ya esten todos los
  servidores funcionando. evita el problema de que una conexion del monitor
  con un servidor inicie antes que este pueda escucharla
  */
  function(callback) {
    setTimeout(function(){ callback(null); }, 1000);
  },

  function(callback) {

    console.log("levantando monitor");
    shell_ejec("start ventana /K \"cd monitor && node monitor.js\"");
    callback(null);
  }
];
async.waterfall(operaciones, function (err, evento) {
  console.log("todos los servidores activos");
});
