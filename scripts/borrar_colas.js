var shell = require('./shell')
var terminal = require("./propiedades.json").shell.terminal;

// 3.6.10 en la pc
var version_rabbit = "3.6.10";

/*
/C para abrir terminal, ejecutar y cerrar al terminar
/K para abrir terminal, ejecutar y no cerrar al terminar
*/
var direc_base = "start " + terminal + " /C \"c: && cd Program Files\\RabbitMQ Server\\rabbitmq_server-" + version_rabbit + "\\sbin";

shell.execCommand(direc_base + " && rabbitmqctl stop_app && rabbitmqctl reset && rabbitmqctl start_app\"", function (returnvalue) {
                          console.log("Todas las colas eliminadas");
                        });
