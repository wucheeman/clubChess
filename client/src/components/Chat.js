import React, { Component } from 'react';
import io from "socket.io-client";
import axios from 'axios';
import './Chat.css'; 

class Chat extends Component {

  constructor(props) {
    super(props);
    this.state = {
      username: ''
    };

    this.socket = io.connect();

    this.socket.on('chat message', function(msg){
      console.log(msg);
    });
   
  }

  componentDidMount() {
    axios.defaults.headers.common['Authorization'] = sessionStorage.getItem('jwtToken');
    axios.get('/api/user')
      .then(res => {
        this.setState({username: sessionStorage.getItem('username')});
        this.setState({ users: res.data });
        console.log(this.state.users);
      })
      .catch((error) => {
        if(error.response.status === 401) {
          this.props.history.push("/login");
        }
      });
  }

  logout = () => {
    sessionStorage.removeItem('jwtToken');
    window.location.reload();
  }

  handleChatSend() {
    console.log('got a click from the send button');
    this.socket.emit('chat message', 'message!');
  }


  render() {
    return (
      <div className="container chatbox">
          <div>
          <h1>Chat Messages</h1>
            <ul id="messages"></ul>
            <form className="chatForm" action="">
              <input id="m" onClick={this.handleChatSend} autocomplete="off" /><button>Send</button>
            </form>
          </div>
      </div>
    );
  }
}

export default Chat;