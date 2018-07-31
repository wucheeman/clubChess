import React, { Component } from 'react';
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
              <li className="breadcrumb-item active" aria-current="page">Lobby</li>
            </ol>
          </nav>
        </div>

          <div className="panel panel-default">

            <div className="panel-heading">
              <h2 className="panel-title">
                Club Lobby &nbsp;
              </h2>
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
      </div>
      </Wrapper>

    );
  }
}

export default Lobby;