import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

// Depending on the current path, this component sets the "active" class on the appropriate navigation link item
const Navbar = props => (
  <nav className="navbar navbar-expand-sm navbar-light bg-secondary pl-5 d-flex justify-content-between">
    <Link className="navbar-brand pr-5 mr-5" to="/">
      Club Chess
    </Link>
    <div>
      <button className="btn btn-primary" onClick={ () => {
            sessionStorage.removeItem('jwtToken');
            window.location.reload();
          } }>Logout</button>
    </div>
  </nav>
);

export default Navbar;
