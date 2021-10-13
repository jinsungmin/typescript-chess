import React from 'react';
import './App.css';
import "bootstrap/dist/css/bootstrap.css"; // Import precompiled Bootstrap css

import { BrowserRouter as Router, Route } from 'react-router-dom';

import Init from './components/Init/Init';
import Signup from './components/Init/signup';
import Main from './components/Init/main';
import Game from './components/Game/game';
import GameSolo from './components/Game/gameSolo';

const App = () => {
  return (
    <>
      <Router>
        <Route path="/" exact component={Init} />
        <Route path="/signup" exact component={Signup} />
        <Route path="/home" exact component={Main} />
        <Route path="/game" exact component={Game} />
        <Route path="/game/solo" exact component={GameSolo} />
      </Router>
    </>
  )
}

export default App;
