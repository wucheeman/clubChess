
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Lobby from "./components/Lobby";
import Gameroom from "./components/Gameroom";
import Directory from "./components/Directory";
import Profile from './components/Profile';
import NoMatch from './components/NoMatch';

const App = () => (
  <Router>
    <div>
      <Switch>
        <Route exact path="/" component={Lobby} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/register" component={Register} />
        <Route exact path="/gameroom" component={Gameroom} />
        <Route exact path="/directory" component={Directory} />
        <Route exact path="/profile" component={Profile} />

        <Route component={NoMatch} /> */
      </Switch>
    </div>
  </Router>
);

export default App;