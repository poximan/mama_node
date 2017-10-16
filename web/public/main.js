$(function() {

  var FADE_TIME = 150; // ms
  var $window = $(window);
  var $messages = $('.messages'); // Messages area
  var $inputMessage = $('.inputMessage'); // Input message input box


  var connected = false;
  var typing = false;

  var socket = io();

  // Sends a chat message
  function sendMessage () {
    var message = $inputMessage.val();
    // Prevent markup from being injected into the message
    message = cleanInput(message);
    // if there is a non-empty message and a socket connection
    if (message && connected) {

      $inputMessage.val('');
      addChatMessage(message);

      var payload = {};

      if((message.match(/:res/) || []).length > 0){

        var particion1 = message.split(":");
        var id_compra = particion1[0];        // el argumento antes del ":"

        var particion2 = particion1[1].split("=");
        var decision_compra = particion2[1];  // el argumento despues del "="

        message = particion2[0];  // la parte que quedo en el medio

        payload = {
          id : id_compra,
          decision : decision_compra
        }
      }
      socket.emit(message, payload);
    }
  }

  // Log a message
  function log (message) {
    var $el = $('<li>').addClass('log').text(message);
    addMessageElement($el);
  }

  // Adds the visual chat message to the message list
  function addChatMessage (data) {

    var $messageBodyDiv = $('<span class="messageBody">')
      .text(data);

    var $messageDiv = $('<li class="message"/>')
      .append($messageBodyDiv);

    addMessageElement($messageDiv);
  }

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  function addMessageElement (el) {

    var $el = $(el);

    $el.hide().fadeIn(FADE_TIME);
    $messages.append($el);

    $messages[0].scrollTop = $messages[0].scrollHeight;
  }

  // Prevents input from having injected markup
  function cleanInput (input) {
    return $('<div/>').text(input).text();
  }

  // Keyboard events
  $window.keydown(function (event) {

    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if (!connected) {
        connected = true;
        log(message);
      }
      sendMessage();
    }
  });

  // Socket events

  socket.on("resultadoFormaEntrega", function (evento) {

    var texto = "compra " + evento.id + ": ¿forma de entrega?.";
    texto += "usar: \"{id compra}:resEntrega={retira|correo}\""

    addChatMessage(texto);
  });

  socket.on("resultadoMedioPago", function (evento) {

    var texto = "compra " + evento.id + ": ¿medio de pago?.";
    texto += "usar: \"{id compra}:resPago={debito|credito}\""

    addChatMessage(texto);
  });

  socket.on("resultadoConfirmar", function (evento) {

    var texto = "compra " + evento.id + ": ¿confirma compra?.";
    texto += "usar: \"{id compra}:resConfirma={confirmada|cancelada}\""

    addChatMessage(texto);
  });

  socket.on("resEstado", function (preguntas) {

    preguntas.forEach(function(pregunta) {

      var texto = "compra " + pregunta.id + " : " + pregunta.compra.entrega;
      texto += " : " + pregunta.compra.medio + " : " + pregunta.compra.estado;

      addChatMessage(texto);
    });
  });
});
