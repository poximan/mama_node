# mama_node
Implementación nodejs/rabbitmq de una infraestructura mom


## Resumen del ejercicio implementado
El proceso inicia cuando el cliente indica que desea comprar un producto. Inmediatamente el departamento de Infracciones comienza una revisión del chat entre el vendedor y el comprador en búsqueda de violaciones al reglamento del sitio. El departamento de Publicaciones, a su vez, reserva el producto para asegurar el cumplimiento de las condiciones de venta en caso de que la compra sea exitosa. Luego el comprador elige la forma de entrega y de pago. En caso de que el comprador decida que el producto se le envíe por correo, el departamento de Envíos calcula el costo del envío antes de que el comprador elija la forma de pago. Consecuentemente se le informa al comprador un resumen de las condiciones de compra, y se le solicita confirmar la misma. Si la confirma, y no hay infracción, el departamento de Pagos procede a efectivizar el pago (utilizando los servicios provistos por los medios de pagos contratados). Una vez que el pago es confirmado, el departamento de Envíos agenda el envío con la empresa de correo elegida.

Existen tres tipos de servidores: de lógica del negocio, de mensajería, y web. Cada servidor de lógica del negocio se dedica a una de las siguientes funciones: Compras, Envíos, Infracciones, Pagos, Publicaciones y Web.

La interacción entre los servidores web y de lógica del negocio es mediada por un servidor de mensajería, que aloja las colas de mensajes a través de las cuales el proceso se lleva adelante. Un servidor web permite a los clientes acceder a la funcionalidad de compra/venta.
Todos los servidores persisten regularmente su estado. En el caso de que un servidor caiga, el mismo puede re-iniciarse a su estado persistido.

## Requisitos del sistema
* La plataforma de trabajo fue Windows 7 32 bits y Windows 10.
* Debe estar instalado Node.js®, entorno de ejecución para JavaScript (https://nodejs.org/es/download/). Este proyecto fue desarrollado con v6.11.2.
* Agregar al path de variables de entorno, la carpeta destino donde se instalo nodejs. Por ej. C:\Program Files\nodejs\
* Debe estar instalado RabbitMQ, agente de mensajes de un infraestructura MOM (https://www.rabbitmq.com/download.html). Este proyecto fue desarrollado con v3.6.10.
* Debe estar instalado MongoDB, SGBD NoSQL orientado a documentos (https://www.mongodb.com/). Este proyecto fue desarrollado con v3.4.

## Paquetes necesarios
* Sincronizar "async" (npm install async).
* Cliente bd "mongodb" (npm install mongodb). Es necesario crear manualmente la carpeta "C:\data\db", en donde mongo aloja por defecto las colecciones.
* Utileria "underscore" (npm install underscore).
* Verificador de actividad de procesos "ps-node" (npm install ps-node).
* Cliente mom "amqp" (npm install amqplib). la implementacion es rabbitmq, que sigue esta especificación.
* Socket bidireccional "socketio" (npm install socket.io). aplicacion que se monta sobre socket tcp para brindar servicio de eventos (tal como eventemitter pero distribuido).
* Web framework "express" (npm install express).

## Ejecutar el sistema
Clonar el proyecto https://github.com/poximan/mama_node.git o descargarlo desde el repositorio https://github.com/poximan/mama_node.

Desde el raíz del proyecto, ir a /scripts. Alli estan todos los scripts necesarios para automatizar la ejecución; estos incluyen:
* "borrar_colas" para eliminar todas las colas y exchange del servidor MOM.
* "crear_cola {"nombre"}" para crear una cola con el nombre "cola_+{argumento especificado entre llaves}". Incluye las reglas de binding *.nombre.*.
Por ejemplo el comando "node crear_cola prueba" creará "cola_prueba".
* "crear_colas" para crear automaticamente todas las colas que necesita el sistema para funcionar.
* "levantar_bd {nueva|actual}" para ejecutar el servidor de BD. Argumento "nueva" para una BD en blanco, o "actual" para continuar sobre la existente.
* "levantar_serv {man|auto}" para ejecutar todos los servidores del negocio y monitor comun. Este ultimo concentra informacion de todos los demas, y funciona de canal de acceso para mantenimiento y consulta de estados.
* "levantar_todo {nueva|actual} {man|auto}" que combina los dos anteriores, permitiendo un unico paso ejecutar la activacion del SGBD seguido del arranque de todos los servidores.

Los demas archivos dentro de la carpeta /script son de uso auxiliar, y no deben interactuar directamente con el usuario.

## Modos de operacion del sistema
En automático el sistema solo se puede observar, opcionalmente pueden cargarse parámetros iniciales desde propiedadesGlobal.json en el directorio raíz para configuraciones globales, y propiedades.json en la carpeta de cada servidor, para configuraciones que solo tienen sentido en ese ambito.
En manual el sistema se puede observar y configurar al igual que en automático, y también comandar, tomando decisiones en los puntos de control, y disparando tareas aperiódicas como persistir la base de datos, o generar un corte consistente del sistema. Para esto se utilizó una implementación del algoritmo de instantánea de "chandy y lamport", descrito en "sistemas distribuidos, conceptos y diseño 3ra edicion" de coulouris, pag.385.

El acceso al monitor es mediante "http://{ip|localhost}:5006/index.html".
Para saber qué comandos están permitidos en cada servidor, desde el area de texto reservada para comunicarse con este, usar el comando especial "?". Esto devuelve una lista de valores igual a los comandos que acepta. En automático acepta algunos menos que en manual, ya que no es posible comandar, tan solo observar.

### Shell's
Como se trata de un sistema distribuido, cada servidor es ejecutado desde un shell distinto.
* Como son 6 servidores de negocio, se levantan 6 entornos de ejecución diferentes para el negocio.
* Ademas, se levanta uno para iniciar el servidor de base de datos (DBMS) mongodb, que queda a la escucha de conexiones entrantes. En caso de probarse este sistema en 6 equipos distintos, cada DBMS atenderá 1 conexion, pero de probarse todo el sistema en un unico equipo, atenderá 6 conexiones.
* Por ultimo, se levanta un shell exclusivamente para ver la salida del monitor bidireccional, que cumple dos funciones:
  * En automático, colecta datos de los servidores del negocio y los presenta a un cliente monitor web.
  * En manual, lo mismo que en automático y ademas, escucha los post (peticiones o comandos) desde el cliente monitor web hacia los servidores del negocio. Funciona como un concentrador.

## Arquitectura
* Los tres tipos de servidores descritos (ver Resumen del ejercicio implementado) se contruyeron segun el siguiente esquema:

{servidor del negocio} serv_negocio/serv_monitor <-> {concentrador} cliente_monitor/serv_web <-> {usuario} cliente_web.

En este modelo el negocio es Servidor/Servidor, en tanto que el concentrador es Cliente/Servidor. Esto implica una conexion socket por cada Servidor monitor que es accedido desde el cliente monitor alojado en el Concentrador.

* Esta arquitectura no es optima, y se sugiere refactorizar con miras a una con este esquema:

{servidor del negocio} serv_negocio/cliente_monitor <-> {concentrador} serv_monitor/serv_web <-> {usuario} cliente_web.

Aqui el negocio seria Servidor/Cliente y el concentrador Servidor/Servidor. Como beneficio el concentrador podría mantener un unico bus distribuido, explotando mejor la potencia de socket.io con el uso de salas de chat en vez de sockets.
