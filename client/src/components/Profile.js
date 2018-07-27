import React, { Component } from 'react';
// import ReactDOM from 'react-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Wrapper from './Wrapper';

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
    });
  }

  // add password and user name later?
  render() {
    const { name, phonenum, status } = this.state;
    return (
      <Wrapper>
      <Navbar />
      <div className="container">
        <form className="form-profile" onSubmit={this.onSubmit}>
          <h2 className="form-profile-heading">Profile for {this.state.username}</h2>
          <label for="inputName" >Name</label>
          <input type="text" className="form-control" placeholder="Jane Doe" name="name" value={name} onChange={this.onChange}/>
          <label for="inputPhonenum" >Phone Number</label>
          <input type="text" className="form-control" placeholder="123-1234" name="phonenum" value={phonenum} onChange={this.onChange} />
          <label for="inputStatus">Status</label>
          <input type="text" className="form-control" placeholder="On-line" name="status" value={status} onChange={this.onChange} />
          <br />
          <button className="btn btn-primary" type="submit">Update</button>
        </form>
        <div>
          <br />
          <Link to="/directory">
            To the Member Directory
          </Link>
        </div>
      </div>
      </Wrapper>
    );
  }
}

export default Profile;