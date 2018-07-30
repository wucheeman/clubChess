module.exports = function(io) {

var users = {};
var lobbyUsers = {};
var activeGames = {};

  io.on('connection', function(socket){
    console.log('a user connected via socket.io');
    // socket.on('chat message', function(msg) {
    //   console.log('message: ' + msg);
      // io.emit('chat message', msg);
    // });

    socket.on('login', function(userId) {
      doLogin(socket, userId);
    });

    function doLogin(socket, userId) {
      socket.userId = userId;  
      console.log(userId + ' signed in');
      if (!users[userId]) {
        console.log('creating new user');
        users[userId] = {userId: socket.userId, games:{}};
      } 
      // uncomment when game resume is supported 
      // else {
      //   console.log('user found!');
      //   Object.keys(users[userId].games).forEach(function(gameId) {
      //     console.log('gameid - ' + gameId);
      //   });
      // }
      
      console.log('sending login message to client');
      socket.emit('login', {users: Object.keys(lobbyUsers), 
                            games: Object.keys(users[userId].games)});
      lobbyUsers[userId] = socket;
      
      // sends to all clients except one who logged in
      console.log(`broadcasting that ${socket.userId} is joining the gameroom`);
      socket.broadcast.emit('joinlobby', socket.userId);
    } // end of doLogin


    socket.on('invite', function(opponentId) {
      console.log('got an invite from: ' + socket.userId + ' --> ' + opponentId);
      
      socket.broadcast.emit('leavelobby', socket.userId);
      socket.broadcast.emit('leavelobby', opponentId);
      
      var game = {
          id: Math.floor((Math.random() * 100) + 1),
          // TODO: delete this?
          board: null, 
          users: {white: socket.userId, black: opponentId}
      };
      
      // invitation comes in on white's socket
      // so only white has game.id associated with socket
      socket.gameId = game.id;
      activeGames[game.id] = game;

      // added in debugging
      console.log('ensuring both user game records are empty')
      // console.log(typeof users[socket.userId].games);
      users[game.users.white].games = {};
      console.log(users[game.users.white].games);
      users[game.users.black].games = {};
      console.log(users[game.users.black].games);
      console.log('done emptying');

      users[game.users.white].games[game.id] = game.id;
      users[game.users.black].games[game.id] = game.id;

      console.log('starting game: ' + game.id);
      lobbyUsers[game.users.white].emit('joingame', {game: game, color: 'white'});
      lobbyUsers[game.users.black].emit('joingame', {game: game, color: 'black'});
      
      delete lobbyUsers[game.users.white];
      delete lobbyUsers[game.users.black];   
      
      // broadcast to clients other than two that just started playing
      socket.broadcast.emit('gameadd', {gameId: game.id, gameState:game});
    });

    // TODO: understand what this is doing!
    socket.on('resumegame', function(gameId) {
      console.log('ready to resume game: ' + gameId);
      
      socket.gameId = gameId;
      var game = activeGames[gameId];
      
      users[game.users.white].games[game.id] = game.id;
      users[game.users.black].games[game.id] = game.id;

      console.log('resuming game: ' + game.id);
      if (lobbyUsers[game.users.white]) {
          lobbyUsers[game.users.white].emit('joingame', {game: game, color: 'white'});
          delete lobbyUsers[game.users.white];
      }
      
      if (lobbyUsers[game.users.black]) {
          lobbyUsers[game.users.black] && 
          lobbyUsers[game.users.black].emit('joingame', {game: game, color: 'black'});
          delete lobbyUsers[game.users.black];  
      }
    });

    socket.on('move', function(msg) {
      console.log('got the move emission');
      socket.broadcast.emit('move', msg);
      activeGames[msg.gameId].position = msg.position;
      console.log(msg);
    });

    // TODO: fix bug # 2
    socket.on('resign', function(msg) {
      console.log("resign: " + msg);

      delete users[activeGames[msg.gameId].users.white].games[msg.gameId];
      delete users[activeGames[msg.gameId].users.black].games[msg.gameId];
      delete activeGames[msg.gameId];

      socket.broadcast.emit('resign', msg);
    });


    socket.on('leave-room', function(msg){
      console.log('user left gameroom');

      console.log(msg);
      console.log(socket.userId);
      delete lobbyUsers[socket.userId];

      // uncommented in debugging effort
      socket.broadcast.emit('leavelobby', socket.userId);

      
      // socket.broadcast.emit('logout', {
      //   userId: socket.userId,
      //   gameId: socket.gameId
      // });
    });

  // TODO: fix bug # 1
    // this logs when page refreshes or user closes the page
    socket.on('disconnect', function(msg){
      console.log('user disconnected');

      // console.log(msg); 

      console.log(users[socket.userId]);
      console.log(users[socket.userId].games);
      console.log(Object.keys(users[socket.userId].games));
      let gameIdProp = Object.keys(users[socket.userId].games);
      console.log(users[socket.userId].games[gameIdProp]);

      // probably don't need this logic; determine during refactoring
      let gameToBeDisconnected;
      if (socket.gameId) {
        gameToBeDisconnected = socket.gameId;
      } else {
        gameToBeDisconnected = users[socket.userId].games[gameIdProp];
      }

      // if (socket && socket.userId && socket.gameId) {
      if (socket && socket.userId && gameToBeDisconnected) {
        console.log(socket.userId + ' disconnected');
        // console.log(socket.gameId + ' disconnected');
        console.log(gameToBeDisconnected + ' disconnected');
      }
      
      delete lobbyUsers[socket.userId];
      
      console.log('logging out ' + socket.userId);
      // console.log('ending game: ' + socket.gameId);
      console.log('ending game: ' + gameToBeDisconnected);
      
      // TODO: delete all these?
      // console.log(users[socket.userId]);
      // console.log(users[socket.userId].games);
      // console.log(Object.keys(users[socket.userId].games));
      // let gameIdProp = Object.keys(users[socket.userId].games);
      // console.log(users[socket.userId].games[gameIdProp]);
      // console.log(users[socket.userId].games.game.id);
      // console.log(activeGames);
      socket.broadcast.emit('logout', {
        userId: socket.userId,
        // gameId: socket.gameId
        gameId: gameToBeDisconnected
      });

      // new in debugging
      console.log('emptying user game record')
      // console.log(typeof users[socket.userId].games);
      users[socket.userId].games = {};
      console.log(users[socket.userId].games);
      console.log('done emptying');
    });

    // for chat functionality in gameroom games
    socket.on('chat message', function(msg) {
      console.log('message: ' + msg);
      // io.emit('chat message', msg);
      socket.broadcast.emit('chat message', msg);
    });

    //TODO: cleanup unless somehow these are needed
    /////////////////////
    // Dashboard messages 
    /////////////////////
    // socket.on('dashboardlogin', function() {
    //   console.log('dashboard joined');
    //   socket.emit('dashboardlogin', {games: activeGames}); 
    // });

  }); // end of io.on('connection'...)

}