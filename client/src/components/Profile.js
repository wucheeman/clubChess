import React, { Component } from 'react';
// import ReactDOM from 'react-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Wrapper from './Wrapper';
import './Page.css';

class Profile extends Component {

  constructor() {
    super();
    this.state = {
      username: '',
      password: '',
      name: '',
      phonenum: '',
      status: ''
    };
  }

  componentDidMount() {
    axios.defaults.headers.common['Authorization'] = sessionStorage.getItem('jwtToken');
    axios.get('/api/user')
      .then(res => {
        this.setState({username: sessionStorage.getItem('username')});
        // this.setState({ users: res.data });
        // console.log(this.state.users);
      })
      .catch((error) => {
        if(error.response.status === 401) {
          this.props.history.push("/login");
        }
      });
  }

  onChange = (e) => {
    const state = this.state
    state[e.target.name] = e.target.value;
    this.setState(state);
  }

onSubmit = (e) => {
  e.preventDefault();
  console.log('in onSubmit');
  const { username, name, phonenum, status } = this.state;
  console.log(username, name, phonenum, status);
  axios.post('/api/user/profile', { username, name, phonenum, status })
    .then((result) => {
      console.log(result);
      window.location.href="/directory";
    });
  }

  // add password and user name later?
  render() {
    const { name, phonenum, status } = this.state;
    return (
      <Wrapper>
      <Navbar />
      <div className='container ml-5'>

        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb pl-0">
              <li className="breadcrumb-item"><a href="/">Lobby</a></li>
              <li className="breadcrumb-item"><a href="/directory">Directory</a></li>
              <li className="breadcrumb-item active" aria-current="page">Profile</li>
            </ol>
          </nav>
        </div>

        {/* <div className="container"> */}
          <form className="form-profile" onSubmit={this.onSubmit}>
            <h3 className="form-profile-heading mb-0 pt-1">Profile for {this.state.username}</h3>
            <label htmlFor="inputName" className='profileLabel pt-3' >Name</label>
            <input type="text" className="form-control" placeholder="Jane Doe" name="name" value={name} onChange={this.onChange}/>
            <label htmlFor="inputPhonenum" className='profileLabel pt-3'>Phone Number</label>
            <input type="text" className="form-control" placeholder="987-123-1234" name="phonenum" value={phonenum} onChange={this.onChange} />
            <small id="phoneNumHelp" class="form-text text-muted">Please use 10 digits with dashes as shown</small>
            <label htmlFor="inputStatus" className='profileLabel pt-3'>Status</label>
            <input type="text" className="form-control" placeholder="On-line" name="status" value={status} onChange={this.onChange} />
            <br />
            <button className="btn btn-primary" type="submit">Update</button>
          </form>

          {/* <div>
            <br />
            <Link to="/directory">
              To the Member Directory
            </Link>
          </div> */}

        {/* </div> */}
      </div>
      </Wrapper>
    );
  }
}

export default Profile;