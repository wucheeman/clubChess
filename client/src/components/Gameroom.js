import React from 'react';
import { Link } from 'react-router-dom';
import io from "socket.io-client";

export default class Gameroom extends React.Component {

  constructor(props){
    super(props);

    this.state = {
        username: '',
        usersOnline: [],
        opponentID: '',
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

  this.sendInvite = ev => {
    console.log('got an invite to send');

  }

    // this.setOpponentID = this.setOpponentID.bind(this);

  } // end of constructor

  componentDidMount() {
    this.state.username = sessionStorage.getItem('username');
    this.login();
  }

  // setOpponentID = (user) => {
  //   this.setState({opponentID: user});
  //   console.log('opponentID is ' + this.state.opponentID);
  // }

  render() {
    return (
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
              <button onClick={this.sendInvite} className="btn btn-primary btm-sm">{user}</button>
            )}
          </div>
        <Link to="/">Back to Lobby</Link>
      </div>
    );
  } // end of render
}
