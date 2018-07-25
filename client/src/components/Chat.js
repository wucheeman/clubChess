import React, { Component } from 'react';
import axios from 'axios';

class Chat extends Component {

  constructor(props) {
    super(props);
    this.state = {
      username: ''
    };
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

  render() {
    return (
      <div className="container">
        <div className="panel panel-default">
          <div className="panel-heading">
            <h6>
              Chat for {sessionStorage.getItem('username')}!
            </h6>
          </div>
          <div>
<p>Welcome to Chat!</p>
          </div>
        </div>
      </div>
    );
  }
}

export default Chat;