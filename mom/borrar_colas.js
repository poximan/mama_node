var shell_ejec = require('../shell')
//var amqp = require('amqplib/callback_api');

shell_ejec("start cmd.exe /C \"c: && cd Program Files\\RabbitMQ Server\\rabbitmq_server-3.6.10\\sbin && rabbitmqctl stop_app && rabbitmqctl reset && rabbitmqctl start_app\"");