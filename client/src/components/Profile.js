import React, { Component } from 'react';
// import ReactDOM from 'react-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';

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

  onChange = (e) => {
    const state = this.state
    state[e.target.name] = e.target.value;
    this.setState(state);
  }

  onSubmit = (e) => {
    e.preventDefault();

    const { name, phonenum, status } = this.state;

    // axios.post('/api/auth/register', { username, password })
    //   .then((result) => {
    //     this.props.history.push("/login")
    //   });
  }

  // add password and user name later?
  render() {
    const { name, phonenum, status } = this.state;
    return (
      <div className="container">
        <form className="form-profile" onSubmit={this.onSubmit}>
          <h2 className="form-profile-heading">Your Profile</h2>
          <label for="inputName" >Name</label>
          <input type="text" className="form-control" placeholder="Jane Doe" name="name" value={name} onChange={this.onChange}/>
          <label for="inputPhonenum" >Phone Number</label>
          <input type="text" className="form-control" placeholder="123-1234" name="phonenum" value={phonenum} onChange={this.onChange} />
          <label for="inputStatus">Status</label>
          <input type="text" className="form-control" placeholder="On-line" name="status" value={status} onChange={this.onChange} />
          <br />
          <button className="btn btn-lg btn-primary" type="submit">Update</button>
        </form>
        <div>
          <br />
          <Link to="/directory">
            To the Member Directory
          </Link>
        </div>
      </div>
    );
  }
}

export default Profile;