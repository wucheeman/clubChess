
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
// import Navbar from "./components/Navbar";
// import Jumbotron from "./components/Jumbotron";
import Login from "./components/Login";
import Register from "./components/Register";
import Lobby from "./components/Lobby";
import Gameroom from "./components/Gameroom";
import Game from "./components/Game";

// import NoMatch from "./components/NoMatch";
// TODO: does this do anything I need?
// import Wrapper from "./components/Wrapper";

const App = () => (
  <Router>
    <div>
      {/* <Navbar />
      <Jumbotron /> */}
      {/* <Wrapper> */}
        <Switch>
          <Route exact path="/" component={Lobby} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/register" component={Register} />
          <Route exact path="/gameroom" component={Gameroom} />
          <Route exact path="/game" component={Game} />
          {/* <Route exact path="/home" component={Home} />
          <Route exact path="/saved" component={Saved} />
          <Route component={NoMatch} /> */}
        </Switch>
      {/* </Wrapper> */}
    </div>
  </Router>
);

export default App;