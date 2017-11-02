#mama_node
Implementación nodejs/rabbitmq de una infraestructura mom

El proceso inicia cuando el cliente indica que desea comprar un producto. Inmediatamente el departamento de infracciones comienza una revisión del chat entre el vendedor y el comprador en búsqueda de violaciones al reglamento del sitio. El departamento de ventas, a su vez, reserva el producto para asegurar el cumplimiento de las condiciones de venta en caso de que la compra sea exitosa. Luego el comprador elige la forma de entrega y de pago. En caso de que el comprador decida que el producto se le envíe por correo, el departamento de envíos calcula el costo del envío antes de que el comprador elija la forma de pago. Consecuentemente se le informa al comprador un resumen de las condiciones de compra, y se le solicita confirmar la misma. Si la confirma, y no hay infracción, el departamento de pagos procede a efectivizar el pago (utilizando los servicios provistos por los medios de pagos contratados). Una vez que el pago es confirmado, el departamento de envíos agenda el envío con la empresa de correo elegida.

Existen tres tipos de servidores: de lógica del negocio, de mensajería, y web. Cada servidor de lógica del negocio se dedica a una de las siguientes funciones: compras, pagos, reglamentos, productos, clientes, envíos.
La interacción entre los servidores web y de lógica del negocio es mediada por un servidor de mensajería, que aloja las colas de mensajes a través de las cuales el proceso se lleva adelante. Un servidor web permite a los clientes acceder a la funcionalidad de compra/venta.
Todos los servidores persisten regularmente su estado. En el caso de que un servidor caiga, el mismo puede re-iniciarse a su estado persistido.

## Paquetes necesarios
* Sincronizar "async" (npm install async)
* Cliente mom "amqp" (npm install amqplib). la implementacion es rabbitmq, que sigue esta especificación.
* Utileria "underscore" (npm install underscore)
* Cliente bd "mongodb" (npm install mongodb)
* Socket bidireccional "socketio" (npm install socket.io). aplicacion que se monta sobre socket tcp para brindar servicio de eventos (tal como eventemitter pero distribuido)
* Web framework "express" (npm install express).

## Ejecutar el sistema
Desde el raíz del proyecto, ir a /scripts. alli estan todos los scripts necesarios para automatizar la ejecución
se destacan:
* "levantar_bd {nueva|actual}" para ejecutar el servidor de bd
* "levantar_serv {man|auto}" para todo el sistema completo, servidores del negocio y monitor.

En automático el sistema solo se puede observar, opcionalmente pueden cargarse parámetros iniciales desde cfg.json en el directorio raíz.
En manual el sistema se puede observar y configurar al igual que en automático, y también comandar, tomando decisiones en los puntos de control, y disparando tareas a periódicas como persistir la base de datos, o generar un corte consistente del sistema. Para esto se utilizó una implementación del algoritmo de instantánea de "chandy y lamport", descrito en "sistemas distribuidos, conceptos y diseño 3ra edicion" de coulouris, pag.385.

El acceso al monitor es mediante "http://{ip|localhost}:5006/index.html". para saber qué comandos están permitidos, preguntar al servidor mediante el comando especial "?". Esto devuelve una lista de valores igual a los comandos que acepta. En automático acepta algunos menos que en manual.

### Shell's
Como se trata de un sistema distribuido, cada servidor es ejecutado desde un shell distinto.
* Como son 6 servidores de negocio, se levantan 6 entornos de ejecucion diferentes.
* Uno para iniciar el servidor de base de datos, mongodb, que queda a la escucha de conexiones entrantes.
* Uno para el monitor bidireccional, que cumple dos funciones:
** En automático, colecta datos de los servidores del negocio y los presenta a un cliente monitor web.
** En manual, lo mismo que automático y ademas, escucha los post (peticiones o comandos) desde el cliente monitor web hacia los servidores del negocio. funciona como un concentrador. servnegocio/servmonitor <-> climonitor/servweb <-> cliweb.
