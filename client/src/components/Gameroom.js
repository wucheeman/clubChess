import React from 'react';
import { Link } from 'react-router-dom';

export default class Gameroom extends React.Component {
  render() {
    return (
      <div class="page lobby" id='page-lobby'>
      <h1>Game Room</h1>
        <h2 id='userLabel'></h2>
        <h3>Active games</h3>
        <div id='gamesList'>
          No active games
        </div>
        <Link to="/game">Game On!</Link>
        <h3>Online players</h3>
        <div id='userList'>
          No users online
        </div>
        <Link to="/">Back to Lobby</Link>
      </div>
    );
  }
}

