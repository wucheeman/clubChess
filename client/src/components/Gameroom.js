import React from 'react';
import { Link } from 'react-router-dom';
import io from "socket.io-client";
import Chess from 'chess.js';
import Chessboard from "chessboardjsx";
// TODO: delete this and file
// import HumanVsHuman from "./integrations/HumanVsHuman";
import axios from 'axios';
import './Chat.css';
import Wrapper from './Wrapper';
import "./Navbar";

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
            // do not uncomment: left here to underline this message!
            // gameroomVisibility: true,
            // gameVisibility: false,
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

      // handle when user disconnected
      if (msg.gameId) {
        console.log(msg.gameId);
        handleResign(msg);
      }
      // for case when user reloaded during game

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
      // chatText.push(data);
      chatText.unshift(data);
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
    // not DRY with handleResign!
    this.socket.emit('resign', {userId: this.state.username, gameId: this.state.serverGame.id});
    this.setState(
      {
        opponentID: '',
        playerColor: '',
        serverGame: {},
        game: {},
        orientation: '',
        position: '',
        // do not uncomment: left here to underline this message!
        // gameroomVisibility: true,
        // gameVisibility: false,
        chatText: []
      },
    );
    console.log('in handleOverClick, about to emit login');
    this.socket.emit('login', this.state.username);
    this.toggleVisibilty();
  }

  handleInGameLogOut() {
    console.log('handling game lock out ');
    let chatMessage = this.state.username + this.state.serverGame.id;
    this.socket.emit('chat message', chatMessage);
    // this.socket.emit('chat message' `${this.state.username}, ${this.state.serverGame.id}`)
    // not DRY with handleResign!
    this.socket.emit('disconnect', {userId: this.state.username, gameId: this.state.serverGame.id});
    // resetting state, just to be sure; TODO: refactor
    this.setState(
      {
        opponentID: '',
        playerColor: '',
        serverGame: {},
        game: {},
        orientation: '',
        position: '',
        // do not uncomment: left here to underline this message!
        // gameroomVisibility: true,
        // gameVisibility: false,
        chatText: []
      },
    );
    sessionStorage.removeItem('jwtToken');
    window.location.href = "/";
    // console.log('in handleOverClick, about to emit login');
    // this.socket.emit('login', this.state.username);
    // this.toggleVisibilty();
  }


  handleChatClick(event) {
    event.preventDefault();
    console.log('got here');
    let chatMessage = document.getElementById('m').value;
    console.log('sending this message:');
    console.log(chatMessage);
    chatMessage = `${this.state.username}: ${chatMessage}`;
    this.socket.emit('chat message', chatMessage);
    // TODO: refactor; not DRY with updateChatText
    let chatText = [...this.state.chatText];
    // chatText.push(chatMessage);
    chatText.unshift(chatMessage);
    this.setState({chatText: chatText});
    // this clears form and keeps it from reloading the page
    const messageForm = document.getElementsByName('chatForm')[0];
    messageForm.reset();

    return false;
  }

  handleLobbyClick() {
    console.log( this.state.username + ' is going back to lobby');
    this.socket.emit('leave-room', this.state.username);
    window.location.href = "/";
  }

  // TODO: DRY out the Navbars; need a logout component that can handle different cases
  render() {
    return (

      <div className='containerpage'>

        {/* Start of gameroom division of page */}
        {this.state.gameroomVisibility ? 
          <Wrapper>

            <nav className="navbar navbar-expand-sm navbar-light bg-secondary pl-5 d-flex justify-content-between">
              <div>
                <img className='clubLogo pr-3 pb-2' src={require('./../img/navbarKnight.png')} alt="chess piece" />
                <div className="navbar-brand">
                  <span className='navbar-text text-white pt-2'>
                    Club Chess
                  </span>
                </div>
              </div>
              <div>
                <button className="btn btn-primary" onClick={ () => {
                    // code is wet, too!
                    sessionStorage.removeItem('jwtToken');
                    this.handleLobbyClick();
                  }
                }>Logout</button>
              </div>
            </nav>

            <div className='container ml-5'>

              <div>
                <nav aria-label="breadcrumb">
                  <ol class="breadcrumb pl-0">
                    <li class="breadcrumb-item"><a href="#" onClick={() => this.handleLobbyClick()}>Lobby</a></li>
                    {/* <li class="breadcrumb-item"><Link to="/">Back to Lobby</Link></li> */}
                    <li class="breadcrumb-item active" aria-current="page">Game Room</li>
                  </ol>
                </nav>
              </div>

              <div className="page gameroom" id='page-gameroom'>
                  <h2>Game Room</h2>
                    <h6 id='userLabel'>Enjoy your game, {this.state.username}!</h6>
                    {/* <h3>Active games</h3>
                    <div id='gamesList'>
                      No active games
                    </div>
                    <Link to="/game">Game On!</Link> */}
                    <br />
                    <h4 className='pb-1'>Online players</h4>
                      <div id='userList'>
                        {this.state.usersOnline.map(user =>
                          <div className='row w-25 pl-3 pb-3'> 
                            <button onClick={this.handleInviteClick} value={user} className="btn btn-primary btm-sm btn-block">{user}</button>
                          </div>
                        )}
                      </div>
                      {/* TODO: Delete these in cleanup */}
                    {/* <Link to="/">Back to Lobby</Link> */}
                    {/* <button id='returnToLobby' className='btn btn-primary' onClick={() => this.handleLobbyClick()}>Back to Lobby</button> */}
              </div>

            </div>
          </Wrapper> 
        : null }

        {/* Start of game division of page */}
        {this.state.gameVisibility ? 
          <Wrapper>

            <nav className="navbar navbar-expand-sm navbar-light bg-secondary pl-5 d-flex justify-content-between">
            <div>
              <img className='clubLogo pr-3 pb-2' src={require('./../img/navbarKnight.png')} alt="chess piece" />
              <div className="navbar-brand">
                  <span className='navbar-text text-white pt-2'>
                    Club Chess
                  </span>
                </div>
            </div>
              <div>
                <button className="btn btn-primary" onClick={ () => {
                  this.handleInGameLogOut();
                  }
                }>Logout</button>
              </div>
            </nav>

            <div className="page game" id='page-game'>

              <div className='row'>

                <div className='col-sm'>
                  <div className='pt-5 pb-0' style={boardsContainer}>
                    <Chessboard
                      width={320}
                      position={this.state.position}
                      orientation={this.state.orientation}
                      onDrop={this.onDrop}
                    />
                  </div>
                  <div className='gameButtons text-center pt-3'>
                    <button id='game-back' className="btn btn-primary btn-sm" onClick={() => this.handleOverClick()}>Game Over/Resign</button>
                  </div>

                </div>

                <div className='col-sm'>
                  <div className='chatMessages pt-5 pb-0'>
                    <ul className='chatBox mh-100 w-75 list-unstyled' style={{"height": "320px"}}>
                      {this.state.chatText.map(message =>
                        <li className='chatEntry'> { message } </li>
                      )}
                    </ul>
                  </div>

                  <form className="chatForm form-row align-items-center" name="chatForm" onSubmit={(ev) => this.handleChatClick(ev)}>
                    <div className='col-sm-7'>
                      <input type='text' id="m" className='w-100' />
                    </div>
                    <div className='col-sm-3'>
                      <button className='pl-5' id="button" type="submit" value="send" class="btn btn-primary btn-sm">Submit</button>
                    </div>
                    <div className='col-sm-1'></div>
                  </form>
                </div>

              </div>

            </div>
          </Wrapper> 
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