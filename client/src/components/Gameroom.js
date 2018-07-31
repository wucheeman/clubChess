import React from 'react';
import io from "socket.io-client";
import Chess from 'chess.js';
import Chessboard from "chessboardjsx";
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

    // updates list of users in game room waiting to play
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
      console.log(data.game);
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
      if (this.state.serverGame && data.gameId ===   this.state.serverGame) {
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
      console.log('in handleResign');
      console.log(data.gameId);
      console.log('game to end: ' + this.state.serverGame);

      if (data.gameId === this.state.serverGame) {
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

      // handle when user disconnected or reloaded
      if (msg.gameId) {
        console.log('About to call handleResign with gameId: ' + msg.gameId);
        handleResign(msg);
      }

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
    axios.defaults.headers.common['Authorization'] = sessionStorage.getItem('jwtToken');
    axios.get('/api/user')
      .then(res => {
        this.setState({username: sessionStorage.getItem('username')});
        this.setState({ users: res.data });
        console.log(this.state.users);
        this.login();
      })
      .catch((error) => {
        if(error.response.status === 401) {
          this.props.history.push("/login");
        }
      });
  }

  initGame(serverGameObj) {
    console.log('in initGame');
    console.log(serverGameObj)
    // must be here, or DOM is not correctly updated after visibility toggled
    this.toggleVisibilty();
    this.setState({serverGame: serverGameObj.id});
    console.log(this.state.serverGame);

    this.setState({position: 'start'});
    this.setState({orientation: this.state.playerColor});
    this.setState({game: new Chess()});

  }

  onDrop = (source, target) => {
    console.log('in onDrop');

    // prevent move if game over or wrong player
    console.log('playerColor is: ' + this.state.playerColor)
    console.log('the turn is: ' + this.state.game.turn());
    console.log('the position is: '  + this.state.position);

    if (this.state.game.game_over() === true) {
      console.log('GAME OVER!!!');
      return;
    }

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
    console.log(this.state.position);
    this.socket.emit('move', 
                     {move: move,
                      // gameId: this.state.serverGame.id,
                      gameId: this.state.serverGame,
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
    this.socket.emit('resign', {userId: this.state.username, gameId: this.state.serverGame});
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
    console.log('handling game log out ');
    console.log(`username: ${this.state.username}; serverGame.id: ${this.state.serverGame}`);
    let chatMessage = `username: ${this.state.username}; serverGame.id: ${this.state.serverGame}`;
    this.socket.emit('chat message', chatMessage);
    // not DRY with handleResign!
    this.socket.emit('disconnect', {userId: this.state.username, gameId: this.state.serverGame});
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
    chatText.push(chatMessage);
    this.setState({chatText: chatText});
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
                  <ol className="breadcrumb pl-0">
                  {/* href was to '#' */}
                    <li className="breadcrumb-item"><a href="/" onClick={() => this.handleLobbyClick()}>Lobby</a></li>
                    {/* <li class="breadcrumb-item"><Link to="/">Back to Lobby</Link></li> */}
                    <li className="breadcrumb-item active" aria-current="page">Game Room</li>
                  </ol>
                </nav>
              </div>

              <div className="page gameroom" id='page-gameroom'>
                  <h2>Game Room</h2>
                    <h6 id='userLabel'>Enjoy your game, {this.state.username}!</h6>
                    <br />
                    <h4 className='pb-1'>Online players</h4>
                      <div id='userList'>
                        {this.state.usersOnline.map(user =>
                          <div className='row w-25 pl-3 pb-3'> 
                            <button onClick={this.handleInviteClick} value={user} className="btn btn-primary btm-sm btn-block">{user}</button>
                          </div>
                        )}
                      </div>
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
                  <div className='col-sm-1'></div>
                    <div className='col-sm-6'>
                      <input type='form-control-plaintext' id="m" className='chatMsg w-100' />
                    </div>
                    <div className='col-sm-3'>
                      <button className='pl-5' id="button" type="submit" value="send" className="btn btn-primary btn-sm">Submit</button>
                    </div>
                    {/* <div className='col-sm-1'></div> */}
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