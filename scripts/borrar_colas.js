var shell_ejec = require('./shell')

// 3.6.11 en la note ... 3.6.10 en la pc
var direc_base = "start cmd.exe /C \"c: && cd Program Files\\RabbitMQ Server\\rabbitmq_server-3.6.10\\sbin";
shell_ejec(direc_base + " && rabbitmqctl stop_app && rabbitmqctl reset && rabbitmqctl start_app\"");
