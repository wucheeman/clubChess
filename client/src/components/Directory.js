import React, { Component } from 'react';
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

        <div className="panel panel-default">
          <div className="panel-heading">
            <h2 className="panel-title pb-1">
              Club Directory &nbsp;
            </h2>
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
                    <td>{user.status}</td>
                    <td>{user.name}</td>
                    <td>{user.username}</td>
                    <td>{user.phonenum}</td>
                  </tr>
                )}
              </tbody>
            </table>

            <button className="btn btn-primary">
                  <Link className='directoryUpdate text-white' to="/profile">
                    Update Your Profile
                  </Link>
            </button>

          </div>
        </div>

      </div>
      </Wrapper>
    );
  }
}

export default Directory;
