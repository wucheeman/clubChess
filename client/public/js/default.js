$(function () {
  var socket = io();
  var username;
  var opponentname;
  var usersOnline = [];
  var myGames = [];
  var playerColor;
  var serverGame;
  var game;
  var board;

    $(document).ready(function(){
        console.log('doc is ready');
        var playerNames = []
        // var sPageURL = window.location.search.substring(1);
        // var sURLVariables = sPageURL.split('&');
        // for (var i = 0; i < sURLVariables.length; i++) {
        //   var sParameterName = sURLVariables[i].split('=');
        //   playerNames.push(sParameterName[1]);
        // }
        // username = playerNames[0];
        // opponentname = playerNames[1];
        // console.log(username, opponentname);
        username = sessionStorage.getItem('username');
        console.log(username);
        socket.emit('login', username);
        
        $('#page-login').hide();
        $('#page-lobby').show();
   });




  //////////////////////////////
  // Menus
  ////////////////////////////// 

  $('#login').on('click', function() {
    username = $('#username').val();
    console.log('got to login');
    if (username.length > 0) {
        $('#userLabel').text(username);
        socket.emit('login', username);
        
        $('#page-login').hide();
        $('#page-lobby').show();
    } 
  });

  // Game is over so player returns to game room
  $('#game-over').on('click', function() {
    // TODO: improve this kludge
    socket.emit('resign', {userId: username, gameId: serverGame.id});
    socket.emit('login', username);

    $('#page-game').hide();
    $('#page-lobby').show();
  });

  // TODO: fix bug #2
  $('#game-resign').on('click', function() {
    socket.emit('resign', {userId: username, gameId: serverGame.id});
    
    socket.emit('login', username);
    $('#page-game').hide();
    $('#page-lobby').show();
  });

  $('#game-back').on('click', function() {
    console.log('in game-back');
    socket.emit('leave-room', username);
    window.location.href = "/";
  });

  var addUser = function(userId) {
    console.log('in addUser');
    usersOnline.push(userId);
    updateUserList();
  };

  var removeUser = function(userId) {
    console.log('in removeUser');
    for (var i=0; i<usersOnline.length; i++) {
      if (usersOnline[i] === userId) {
          usersOnline.splice(i, 1);
      }
   }
   updateUserList();
  };

  var updateGamesList = function() {
    console.log('in updateGamesList');
    document.getElementById('gamesList').innerHTML = '';
    myGames.forEach(function(game) {
      $('#gamesList').append($('<button>')
                    .text('#'+ game)
                    .on('click', function() {
                      socket.emit('resumegame',  game);
                    }));
    });
  };

  var updateUserList = function() {
    console.log("in updateUserList");
    document.getElementById('userList').innerHTML = '';
    usersOnline.forEach(function(user) {
      $('#userList').append($('<button>')
                    .text(user)
                    .on('click', function() {
                      socket.emit('invite',  user);
                    }));
    });
  };

  //////////////////////////////
  // Socket.io handlers
  ////////////////////////////// 
        
  socket.on('login', function(msg) {
    console.log('server has processed login');
    usersOnline = msg.users;
    updateUserList();
    
    myGames = msg.games;
    updateGamesList();
  });

  socket.on('joinlobby', function (msg) {
    console.log('got joinlobby message');
    addUser(msg);
  });

  socket.on('leavelobby', function (msg) {
    console.log(msg + ' is leaving the lobby');
    removeUser(msg);
  });

  socket.on('joingame', function(msg) {
    console.log("joined as game id: " + msg.game.id );   
    playerColor = msg.color;
    initGame(msg.game);
    $('#page-lobby').hide();
    $('#page-game').show();
  });

  // TODO: does this do anything? should it? could it?
  socket.on('gameadd', function(msg) {
    console.log('game added on server');
  });
  
  // this updates chess.js and chessboard.js
  socket.on('move', function (msg) {
    if (serverGame && msg.gameId === serverGame.id) {
        game.move(msg.move);
        board.position(game.fen());
    }
  });

  socket.on('resign', function(msg) {
    if (msg.gameId == serverGame.id) {
      socket.emit('login', username);
      $('#page-lobby').show();
      $('#page-game').hide();
    }
  });

  //  TODO: fix bug #1
  socket.on('logout', function (msg) {
    console.log('got user logout message re '+ msg.username);
    removeUser(msg.username);
  });

  //////////////////////////////
  // Chess Game
  ////////////////////////////// 
  // this section is boilerplate chessboard.js code
  ////////////////////////////// 

  var initGame = function (serverGameState) {
    serverGame = serverGameState; 
    
    var cfg = {
      draggable: true,
      showNotation: false,
      orientation: playerColor,
      position: serverGame.board ? serverGame.board : 'start',
      onDragStart: onDragStart,
      onDrop: onDrop,
      onSnapEnd: onSnapEnd
    };
          
    game = serverGame.board ? new Chess(serverGame.board) : new Chess();
    board = new ChessBoard('game-board', cfg);
  }
    
  // do not pick up pieces if the game is over
  // only pick up pieces for the side to move
  var onDragStart = function(source, piece, position, orientation) {
    if (game.game_over() === true ||
        (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1) ||
        (game.turn() !== playerColor[0])) {
      return false;
    }
  };  
  
  var onDrop = function(source, target) {
    // see if the move is legal
    var move = game.move({
      from: source,
      to: target,
      promotion: 'q' // NOTE: always promote to a queen for example simplicity
    });
  
    // illegal move
    if (move === null) { 
      return 'snapback';
    } else {
        socket.emit('move', {move: move, gameId: serverGame.id, board: game.fen()});
    }
  
  };
  
  // update the board position after the piece snap 
  // for castling, en passant, pawn promotion
  var onSnapEnd = function() {
    board.position(game.fen());
  };

}); // end of function definition