import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Login.css';

class Create extends Component {

  constructor() {
    super();
    this.state = {
      username: '',
      password: ''
    };
  }
  onChange = (e) => {
    const state = this.state
    state[e.target.name] = e.target.value;
    this.setState(state);
  }

  onSubmit = (e) => {
    e.preventDefault();

    const { username, password } = this.state;

    axios.post('/api/auth/register', { username, password })
      .then((result) => {
        this.props.history.push("/login")
      })
      .catch((error) => {
        // if(error.response.status === 401) {
        //   this.setState({ message: 'Login failed. Username or password not match' });
        // }
        console.log(error);
      });
  }

  render() {
    const { username, password } = this.state;
    return (
      <div class="container">
        <form class="form-signin" onSubmit={this.onSubmit}>
        <img className='logInKnight' src={require('./../img/navbarKnight.png')} alt="chess piece" />
        <h3 className='pageTitle'>Club Chess</h3>
          <h2 class="form-signin-heading">Register</h2>
          <label for="inputEmail" class="sr-only">Email address</label>
          <input type="email" class="form-control" placeholder="Email address" name="username" value={username} onChange={this.onChange} required/>
          <label for="inputPassword" class="sr-only">Password</label>
          <input type="password" class="form-control" placeholder="Password" name="password" value={password} onChange={this.onChange} required/>
          <button class="btn btn-primary btn-block" type="submit">Register</button>
        </form>
      </div>
    );
  }
}

export default Create;