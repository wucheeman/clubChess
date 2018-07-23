import React from 'react';
import { Link } from 'react-router-dom';
import io from "socket.io-client";

export default class Gameroom extends React.Component {

  constructor(props){
    super(props);

    this.state = {
        username: '',
        usersOnline: [],
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

  } // end of constructor

  componentDidMount() {
    this.state.username = sessionStorage.getItem('username');
    this.login();
  }



  render() {
    return (
      <div class="page gameroom" id='page-gameroom'>
      <h1>Game Room</h1>
        <h2 id='userLabel'></h2>
        <h3>Active games</h3>
        <div id='gamesList'>
          No active games
        </div>
        <Link to="/game">Game On!</Link>
        <h3>Online players</h3>
        <div id='userList'>
          {this.state.usersOnline.map(user =>
            <p>{user}</p>
          )}
        </div>
        <Link to="/">Back to Lobby</Link>
      </div>
    );
  }
}

