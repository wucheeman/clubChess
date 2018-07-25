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

    // don't know if this needed
    this.socket = io.connect();

    this.socket.on('chat message', function(msg){
      console.log(msg);
      // $('#messages').append($('<li>').text(msg));
    });


    
  }

  componentDidMount() {
    axios.defaults.headers.common['Authorization'] = sessionStorage.getItem('jwtToken');
    axios.get('/api/user')
      .then(res => {
        this.setState({username: sessionStorage.getItem('username')});
        // TODO: clean up: next two lines are probably not necessary
        // test during cleanup
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
        {/* <div className="panel panel-default">
          <div className="panel-heading"> */}
          <div>
          <h1>Chat Messages</h1>
            <ul id="messages"></ul>
            <form className="chatForm" action="">
              <input id="m" onClick={this.handleChatSend} autocomplete="off" /><button>Send</button>
            </form>
          </div>
        {/* </div> */}
      </div>
    );
  }
}

export default Chat;