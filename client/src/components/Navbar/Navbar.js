import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = props => (
  <nav className="navbar navbar-expand-sm navbar-light bg-secondary pl-5 d-flex justify-content-between">
    <div>
    <img src={require('./../../img/navbarKnight.png')} alt="chess piece" />
    <h3 className="navbar-brand pr-5 mr-5">
      Club Chess
    </h3>
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
