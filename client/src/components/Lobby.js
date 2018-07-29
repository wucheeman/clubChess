import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import Wrapper from './Wrapper';
import './Page.css';


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

  // logout = () => {
  //   sessionStorage.removeItem('jwtToken');
  //   window.location.reload();
  // }

  render() {
    return (
      <Wrapper>
      <Navbar />
      <div className='container ml-5'>

        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb pl-0">
              <li className="breadcrumb-item active" aria-current="page">Lobby</li>
            </ol>
          </nav>
        </div>

        {/* <div className="container"> */}
          <div className="panel panel-default">

            <div className="panel-heading">
              <h3 className="panel-title">
                CLUB LOBBY &nbsp;
                {/* TODO: delete during cleanup; get the &nbsp too */}
                {/* {sessionStorage.getItem('jwtToken') && */}
                  {/* <button className="btn btn-primary" onClick={this.logout}>Logout</button> */}
                {/* } */}
              </h3>
              <h6 className='userWelcome'>
                Welcome, {sessionStorage.getItem('username')}!
              </h6>
            </div>
            <br />
            <div className="panel-body">
              <div className='row'>
                <div className='col-sm-4'>
                  <Link to="/gameroom">
                    To the Game Room
                  </Link>
                </div>
                <div className='col-sm-8'>
                  <p>Find other members who want to play chess now</p>
                </div>
              </div>

              <div className='row'>
                <div className='col-sm-4'>
                  <Link to="/directory">
                    To the Member Directory
                  </Link>
                </div>
                <div className='col-sm-8'>
                  <p>Find contact and other information on club members</p>
                </div>
              </div>

              <div className='row'>
                <div className='col-sm-4'>
                  <Link to="/profile">
                    To Update Your Profile
                  </Link>
                </div>
                <div className='col-sm-8'>
                  <p>Keep your contact information up-to-date</p>
                </div>
              </div>

            </div>
          </div>
        {/* </div> */}
      </div>
      </Wrapper>

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
