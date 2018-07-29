import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = props => (
  <nav className="navbar navbar-expand-sm navbar-light bg-secondary pl-5 d-flex justify-content-between">
    <div>
    <img className='clubLogo pr-3 pb-2' src={require('./../../img/navbarKnight.png')} alt="chess piece" />
    <div className="navbar-brand">
      <span className='navbar-text text-white pt-2'>
        Club Chess
        </span>
    </div>
    </div>
    <div>
      <button className="btn btn-primary" onClick={ () => {
            sessionStorage.removeItem('jwtToken');
            window.location.reload();
          } }>Logout</button>
    </div>
  </nav>
);

export default Navbar;
