import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';

class Lobby extends Component {

  constructor(props) {
    super(props);
    this.state = {
      users: [],
      username: ''
    };
  }

  componentDidMount() {
    axios.defaults.headers.common['Authorization'] = sessionStorage.getItem('jwtToken');
    //console.log(localStorage.getItem('username'));
    //console.log('in componentDidMount');
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

  render() {
    return (
      <div class="container">
        <div class="panel panel-default">
          <div class="panel-heading">
            <h3 class="panel-title">
              CLUB LOBBY &nbsp;
              {sessionStorage.getItem('jwtToken') &&
                <button class="btn btn-primary" onClick={this.logout}>Logout</button>
              }
            </h3>
            <h6>
              Welcome to {sessionStorage.getItem('username')}!
            </h6>
          </div>
          <div class="panel-body">
            <table class="table table-stripe">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Username</th>
                  <th>Future Growth</th>
                </tr>
              </thead>
              <tbody>
                {this.state.users.map(user =>
                  <tr>
                    {/* TODO: convert to opening game room to play that user */}
                    <td><Link to={`/show/${user._id}`}>{user.status}</Link></td>
                    <td>{user.username}</td>
                    <td>TBD</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* <a href={"/gameroom.html?username=" + sessionStorage.getItem('username') + "&opponentname=frodo@baggins.com"}>Play Chess</a> */}
          <a href={"/gameroom.html"}>Game Room</a>
        </div>
      </div>
    );
  }
}

export default Lobby;









// Default code
// import React, { Component } from 'react';
// import logo from './logo.svg';
// import './App.css';

// class App extends Component {
//   render() {
//     return (
//       <div className="App">
//         <header className="App-header">
//           <img src={logo} className="App-logo" alt="logo" />
//           <h1 className="App-title">Welcome to React</h1>
//         </header>
//         <p className="App-intro">
//           To get started, edit <code>src/App.js</code> and save to reload.
//         </p>
//       </div>
//     );
//   }
// }

// export default App;
