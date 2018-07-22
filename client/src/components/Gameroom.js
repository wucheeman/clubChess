import React from 'react';
import { Link } from 'react-router-dom';

export default class Gameroom extends React.Component {
  render() {
    return (
      <div>
        <h1>Got here</h1>
        <Link to="/game">
        Game On!
      </Link>
    </div>
    );
  }
}