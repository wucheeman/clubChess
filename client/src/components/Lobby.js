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
      <div className="container">
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">
              CLUB LOBBY &nbsp;
              {sessionStorage.getItem('jwtToken') &&
                <button className="btn btn-primary" onClick={this.logout}>Logout</button>
              }
            </h3>
            <h6>
              <br />
              Welcome to {sessionStorage.getItem('username')}!
            </h6>
          </div>
          <div className="panel-body">
          <br />
          <Link to="/gameroom">
            To the Game Room
          </Link>
          <br />
          <br />
          <Link to="/directory">
            To the Member Directory
          </Link>
          </div>

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
