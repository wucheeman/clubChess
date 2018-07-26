import React from 'react';
import { Link } from 'react-router-dom';
import io from "socket.io-client";
import Chess from 'chess.js';
import Chessboard from "chessboardjsx";
// TODO: delete this and file
// import HumanVsHuman from "./integrations/HumanVsHuman";
import axios from 'axios';
import './Chat.css';

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
        orientation: '',
        position: '',
        gameroomVisibility: true,
        gameVisibility: false,
        chatText: []
    };

    this.socket = io.connect();

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
      // make a copy of array
      let usersOnline = [...this.state.usersOnline];
      console.log(`before adding, usersOnline is ${usersOnline}`)
      usersOnline.push(newUser);
      console.log(`after adding, usersOnline is ${usersOnline}`)
      // this.setState([...this.state.usersOnline, newUser]);
      // const usersOnline = this.state.usersOnline.push(newUser)
      this.setState({usersOnline: usersOnline});
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
      let position;
      console.log('in updateGame')
      console.log(data);
      if (this.state.serverGame && data.gameId ===   this.state.serverGame.id) {
        this.state.game.move(data.move);
        position = this.state.game.fen()
        this.setState({ position: position });
      }
    }

    this.socket.on('resign', function(msg) {
      console.log('got resign broadcast');
      handleResign(msg);
    });

    const handleResign = (data) => {
      if (data.gameId == this.state.serverGame.id) {
        this.setState(
          {
            opponentID: '',
            playerColor: '',
            serverGame: {},
            game: {},
            orientation: '',
            position: '',
            gameroomVisibility: true,
            gameVisibility: false,
            chatText: []
          },
        );
        this.toggleVisibilty();
        this.socket.emit('login', this.state.username);
        // this.toggleVisibilty();
      }
    }

    this.socket.on('leavelobby', function (msg) {
      console.log(msg + ' is leaving the gameroom');
      removeUser(msg);
    });

    this.socket.on('logout', function (msg) {
      console.log('got user logout message re:');
      console.log(msg);
      removeUser(msg.userId);
      // for case when user reloaded during game
      handleResign(msg);
    });

    const removeUser = (userId) => {
      console.log('in removeUser for ' + userId);
      // make a copy of array
      let usersOnline = [...this.state.usersOnline];
      console.log(`before removal, usersOnline is ${usersOnline}`)
      const remainingUsers = usersOnline.filter(user => user !== userId);
      console.log(`after removal, usersOnline is ${remainingUsers}`)
      this.setState({usersOnline: remainingUsers});
      console.log(`usersOnline now are ${this.state.usersOnline}`);
    };

    this.socket.on('chat message', function(msg){
      console.log('just got this message:');
      console.log(msg);
      updateChatText(msg);
    });

    const updateChatText = (data) => {
      console.log('in updateChatText');
      let chatText = [...this.state.chatText];
      chatText.push(data);
      this.setState({chatText: chatText});
      console.log(`chatText now is ${this.state.chatText}`);
    }


  } // end of constructor

  componentDidMount() {
    // this.state.username = sessionStorage.getItem('username');
    // this.login();
    axios.defaults.headers.common['Authorization'] = sessionStorage.getItem('jwtToken');
    //console.log(localStorage.getItem('username'));
    //console.log('in componentDidMount');
    axios.get('/api/user')
      .then(res => {
        this.setState({username: sessionStorage.getItem('username')});
        this.setState({ users: res.data });
        console.log(this.state.users);
        this.login(); // only addition to code copied from Lobby
      })
      .catch((error) => {
        if(error.response.status === 401) {
          this.props.history.push("/login");
        }
      });
  }

  initGame(serverGameState) {
    console.log('in initGame');
    // must be here, or DOM is not correctly updated after visibility toggled
    this.toggleVisibilty();
    this.setState({serverGame: serverGameState});
    console.log(this.state.serverGame);

    this.setState({position: 'start'});
    this.setState({orientation: this.state.playerColor});
    // const newGame = new Chess();
        // this.setState({game: newGame});
    this.setState({game: new Chess()});
    // this.toggleVisibilty();

  }

  onDrop = (source, target) => {
    // this.removeHighlightSquare();
    console.log('in onDrop');

    // prevent move if game over or wrong player
    console.log('playerColor is: ' + this.state.playerColor)
    console.log('the turn is: ' + this.state.game.turn());
    console.log('the position is: '  + this.state.position);
    // TODO: move this so it triggers when game is over and it's announced in UI
    if (this.state.game.game_over() === true) {
      console.log('GAME OVER!!!');
      return;
    }
    // don't think these are needed
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

  // this moves elements in and out of DOM, so be careful about 
  // where you place calls to it relative to updates to state
  toggleVisibilty() {
    console.log("toggling visibility of game and gameroom!");
    this.setState({gameroomVisibility: !this.state.gameroomVisibility,
                   gameVisibility: !this.state.gameVisibility})
  }


  handleOverClick() {
    console.log('handling game over click');
    this.socket.emit('resign', {userId: this.state.username, gameId: this.state.serverGame.id});
            this.setState(
          {opponentID: '',
          playerColor: '',
          serverGame: {},
          game: {},
          orientation: '',
          position: ''},
        );
    this.socket.emit('login', this.state.username);
    this.toggleVisibilty();
  }

  handleChatClick() {
    let chatMessage = document.getElementById('m').value;
    console.log('sending this message:');
    console.log(chatMessage);
    chatMessage = `${this.state.username}: ${chatMessage}`;
    this.socket.emit('chat message', chatMessage);
    // TODO: refactor; not DRY with updateChatText
    let chatText = [...this.state.chatText];
    chatText.push(chatMessage);
    this.setState({chatText: chatText});
    // this clears form and keeps it from reloading the page
    const messageForm = document.getElementsByName('chatForm')[0];
    messageForm.reset();
    return false;
  }

  handleLobbyClick() {
    console.log( this.state.username + ' ia going back to lobby');
    this.socket.emit('leave-room', this.state.username);
    window.location.href = "/";
  }



  render() {
    return (
      <div className='containerpage'>
      {this.state.gameroomVisibility ? 
        <div className="page gameroom" id='page-gameroom'>
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
            {/* <Link to="/">Back to Lobby</Link> */}
            <button id='returnToLobby' className='btn btn-primary' onClick={() => this.handleLobbyClick()}>Back to Lobby</button>
        </div>
        : null }


        {this.state.gameVisibility ? 
          <div className="page game" id='page-game'>
            <div className='gameButtons'>
              <button id='game-back' className="btn btn-primary btn-sm" onClick={() => this.handleOverClick()}>Game Over/Resign</button>
            </div>
            <div style={boardsContainer}>
              <Chessboard
                width={320}
                position={this.state.position}
                orientation={this.state.orientation}
                onDrop={this.onDrop}
              />
            </div>
            <br />
            <div className='chatMessages'>
              <ul>
                {this.state.chatText.map(message =>
                  <li> { message } </li>
                )}
              </ul>
            </div>
            <form className="chatForm" name="chatForm">
              <input type='text' id="m" />
              <button id="button" type="button" value="send" class="btn btn-primary btn-sm" onClick={() => this.handleChatClick()}>Submit</button>
            </form>
          </div>
         : null }

         <div>
       </div>
      </div>  
    );
  } // end of render
}

// TODO: move to stylesheet
const boardsContainer = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};
const boardStyle = {
  borderRadius: "5px",
  boxShadow: `0 5px 15px rgba(0, 0, 0, 0.5)`
};