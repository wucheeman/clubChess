import React, { Component } from 'react';
// import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import Wrapper from './Wrapper';

class Directory extends Component {

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

  //TODO: delete during cleanup
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
            <li className="breadcrumb-item"><a href="/">Lobby</a></li>
            <li className="breadcrumb-item active" aria-current="page">Directory</li>
          </ol>
        </nav>
      </div>

      {/* <div className="container"> */}
        <div className="panel panel-default">
          <div className="panel-heading">
            <h2 className="panel-title pb-1">
              Club Directory &nbsp;
              {/* TODO: delete during cleanup; get the &nbsp */}
              {/* {sessionStorage.getItem('jwtToken') && */}
                {/* <button className="btn btn-primary" onClick={this.logout}>Logout</button> */}
              {/* } */}
            </h2>
            {/* <h6>
              Welcome to {sessionStorage.getItem('username')}!
            </h6> */}
          </div>
          <div className="panel-body">
            <table className="table border-bottom">
              <thead className='bg-secondary'>
                <tr>
                  <th scope="col">Status</th>
                  <th scope="col">Name</th>
                  <th scope="col">UserID</th>
                  <th scope="col">Phone Number</th>
                </tr>
              </thead>
              <tbody>
                {this.state.users.map(user =>
                  <tr>
                                    {/* <tr scope="row"> */}
                    <td>{user.status}</td>
                    <td>{user.name}</td>
                    <td>{user.username}</td>
                    <td>{user.phonenum}</td>
                  </tr>
                )}
              </tbody>
            </table>
            {/* <hr className='mt-0' /> */}

            <button className="btn btn-primary">
                  <Link className='directoryUpdate text-white' to="/profile">
                    Update Your Profile
                  </Link>
            </button>

          </div>
        </div>

      {/* </div> */}
      </div>
      </Wrapper>
    );
  }
}

export default Directory;









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
