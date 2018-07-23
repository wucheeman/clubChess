import React from 'react';
import { Link } from 'react-router-dom';
import io from "socket.io-client";
import Chess from 'chess.js';
import Chessboard from "chessboardjsx";
import HumanVsHuman from "./integrations/HumanVsHuman";

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
        // no need for this with Chessboard component ?
        // board: {},
        orientation: '',
        position: '',
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

    // this updates chess.js and chessboard.js
    this.socket.on('move', function (msg) {
      console.log('got move broadcast');
      updateGame(msg);
    });

    const updateGame = (data) => {
      console.log(data);
      if (this.state.serverGame && data.gameId ===   this.state.serverGame.id) {
        this.state.game.move(data.move);
        let position = this.state.game.fen()
        this.setState({ position: position });
      }
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

    this.setState({position: 'start'});
    this.setState({orientation: this.state.playerColor});
    // const newGame = new Chess();
        // this.setState({game: newGame});
    this.setState({game: new Chess()});


    // var cfg = {
    //   draggable: true,
    //   showNotation: false,
    //   orientation: this.state.playerColor,
    //   position: this.state.serverGame.board ? this.state.serverGame.board : 'start',
    //   onDragStart: this.onDragStart,
    //   onDrop: this.onDrop,
    //   onSnapEnd: this.onSnapEnd
    // };

    
    // // use this.setState()?
    // this.state.game = this.state.serverGame.board ? new Chess(this.state.serverGame.board) : new Chess();
    // this.state.board = new ChessBoard('game-board', cfg);

  }

  onDrop = (source, target) => {
    // this.removeHighlightSquare();
    console.log('in onDrop');

    // prevent move if game over or wrong player
    console.log('playerColor is: ' + this.state.playerColor)
    console.log('the turn is: ' + this.state.game.turn());
    // TODO: move this so it triggers when game is over and it's announced in UI
    if (this.state.game.game_over() === true) {
      console.log('GAME OVER!!!');
      return;
    }
    // (this.state.game.turn() === 'w' && piece.search(/^b/) !== -1) ||
    // (this.state.game.turn() === 'b' && piece.search(/^w/) !== -1) ||
    if (this.state.game.turn() !== this.state.playerColor[0]) return;

    // see if the move is legal
    var move = this.state.game.move({
      from: source,
      to: target,
      promotion: "q" // NOTE: always promote to a queen for example simplicity
    });

    // illegal move
    if (move === null) return;

    console.log(this.state.game.fen);
    let position = this.state.game.fen()
    this.setState({ position: position });
    // console.log('getting this.state.position');
    console.log(this.state.position);
    this.socket.emit('move', 
                     {move: move,
                      gameId: this.state.serverGame.id,
                      position: position});
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
          {/* <div className="page game" id='page-game'>
            <button id='game-back'>Back</button>
            <button id='game-resign'>Resign</button>
            <div id='game-board' style={{width: '400px'}}>
            </div>
          </div> */}
        <div style={boardsContainer}>
          {/* <HumanVsHuman>
            {({
              position,
              selectedSquares,
              onDrop,
              onMouseOverSquare,
              onMouseOutSquare
            }) => (
              <Chessboard
                id="humanVsHuman"
                width={320}
                orientation={this.state.orientation}
                position={position}
                selectedSquares={selectedSquares}
                onDrop={onDrop}
                onMouseOverSquare={onMouseOverSquare}
                onMouseOutSquare={onMouseOutSquare}
                boardStyle={boardStyle}
              />
            )}
          </HumanVsHuman> */}
          <Chessboard
            width={320}
            position={this.state.position}
            orientation={this.state.orientation}
            onDrop={this.onDrop}
          />
        </div>
      </div>
    );
  } // end of render
}


const boardsContainer = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};
const boardStyle = {
  borderRadius: "5px",
  boxShadow: `0 5px 15px rgba(0, 0, 0, 0.5)`
};