import React from 'react';
import { Link } from 'react-router-dom';
import io from "socket.io-client";
import Chess from 'chess.js';
import ChessBoard from 'chessboardjs';

export default class Gameroom extends React.Component {

  constructor(props){
    super(props);

    this.state = {
        username: '',
        usersOnline: [],
        opponentID: '',
        playerColor: '',
        serverGame: {},
        game: {},
        board: {},
    };

    this.socket = io('localhost:3000');

    

    this.login = () => {
      this.socket.emit('login', this.state.username);
    }

    this.socket.on('login', function(data){
      console.log('client sez: server has processed login');
      completeLogin(data);
      // updateUsersList();
    });

    const completeLogin = data => {
      console.log(data);
      this.setState({usersOnline: data.users});
      console.log('done handling login');
      console.log(this.state.usersOnline);
    }

    this.handleInviteClick = (ev) => {
      const oppenentId = ev.target.value
      console.log('got an invitation to play for ' + oppenentId);
      this.socket.emit('invite', oppenentId);
    }

    // updates list of uses in game room waiting to play
    this.socket.on('joinlobby', function(newUser) {
      console.log(`${newUser} is joining the gameroom`);
      addUser(newUser);
    });

    const addUser = newUser => {
      console.log(`adding ${newUser} to usersOnline`);
      this.setState([...this.state.usersOnline, newUser]);
      // const usersOnline = this.state.usersOnline.push(newUser)
      // this.setState({usersOnline: usersOnline});
      console.log(`usersOnline now are ${this.state.usersOnline}`);
    }

    this.socket.on('joingame', function(data) {
      console.log(`got joingame message`);
      startGame(data);
    });

    const startGame = (data) => {
      console.log('in startGame');
      this.setState({playerColor: data.color});
      console.log(this.state.playerColor);
      this.initGame(data.game);
    }


  } // end of constructor

  componentDidMount() {
    this.state.username = sessionStorage.getItem('username');
    this.login();
  }


  initGame(serverGameState) {
    console.log('in initGame');
    this.setState({serverGame: serverGameState});
    console.log(this.state.serverGame);

    var cfg = {
      draggable: true,
      showNotation: false,
      orientation: this.state.playerColor,
      position: this.state.serverGame.board ? this.state.serverGame.board : 'start',
      onDragStart: this.onDragStart,
      onDrop: this.onDrop,
      onSnapEnd: this.onSnapEnd
    };

    // use this.setState()?
    this.state.game = this.state.serverGame.board ? new Chess(this.state.serverGame.board) : new Chess();
    this.state.board = new ChessBoard('game-board', cfg);

  }


  onDragStart = function() {

  };

  onDrop = function() {

  };

  onSnapEnd = function() {

  };

  render() {
    return (
      <div className='containerpage'>
        <div class="page gameroom" id='page-gameroom'>
          <h1>Game Room</h1>
            <h4 id='userLabel'>Good playing, {this.state.username}</h4>
            <h3>Active games</h3>
            <div id='gamesList'>
              No active games
            </div>
            <Link to="/game">Game On!</Link>
            <h3>Online players</h3>
              <div id='userList'>
                {this.state.usersOnline.map(user => 
                  <button onClick={this.handleInviteClick} value={user} className="btn btn-primary btm-sm">{user}</button>
                )}
              </div>
            <Link to="/">Back to Lobby</Link>
        </div>
          <div className="page game" id='page-game'>
            <button id='game-back'>Back</button>
            <button id='game-resign'>Resign</button>
            <div id='game-board' style={{width: '400px'}}>
            </div>
          </div>
      </div>
    );
  } // end of render
}
