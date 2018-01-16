var shell_ejec = require('./shell_sin_cb')

// 3.6.10 en la pc
var version_rabbit = "3.6.10";

var direc_base = "start cmd.exe /C \"c: && cd Program Files\\RabbitMQ Server\\rabbitmq_server-" + version_rabbit + "\\sbin";
shell_ejec(direc_base + " && rabbitmqctl stop_app && rabbitmqctl reset && rabbitmqctl start_app\"");
