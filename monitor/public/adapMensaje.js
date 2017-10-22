$(function() {

  var socket = io();

  var FADE_TIME = 150; // ms
  var $window = $(window);
  var $messages = $('.messages'); // Messages area
  var $inputMessage = $('.inputMessage'); // Input message input box
  var $servidor = $('.servidor').text().trim().split(" ")[1].split(",")[0].toLowerCase();

  // Sends a chat message
  function sendMessage (message) {

    // Prevent markup from being injected into the message
    message = cleanInput(message);

    var instancia;
    var msg = {message, instancia};

    // if there is a non-empty message and a socket connection
    if (message) {

      $inputMessage.val('');
      addChatMessage(message);

      if((message.match(/:res/) || []).length > 0){

        var particion1 = message.split(":");
        var id_compra = particion1[0];        // el argumento antes del ":"

        var particion2 = particion1[1].split("=");
        var decision_compra = particion2[1];  // el argumento despues del "="

        msg.message = particion2[0];  // la parte que quedo en el medio

        msg.instancia = {
          id : id_compra,
          decision : decision_compra
        }
      }
      socket.emit($servidor, msg);
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

    var message = $inputMessage.val();
    // When the client hits ENTER on their keyboard
    if (event.which === 13)
      sendMessage(message);
  });

  // Socket events

  socket.on("resultadoCosto", function (evento) {

    var texto = "compra " + evento.id + ": costo adic correo. ";
    texto += "usar: \"{id compra}:resCosto={numero}\""

    addChatMessage(texto);
  });

  socket.on("resEstado", function (preguntas) {
    preguntas.forEach(function(pregunta) {

      var texto = "compra " + pregunta.id + " => " +
      pregunta.compra.estado + " : " +
      pregunta.compra.entrega + " : " +
      pregunta.compra.reserva + " : " +
      pregunta.compra.pago + " : " +
      pregunta.compra.infracciones + " : " +
      pregunta.compra.medio;

      addChatMessage(texto);
    });
  });

  socket.on("res?", function (preguntas) {
    addChatMessage(preguntas);
  });
});
