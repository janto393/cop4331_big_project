import React from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import './App.css';


import MyRecipesPage from './pages/MyRecipesPage';

function App() {
  return (
    <Router >
      <Switch>
        <Route path="/" exact>
          <MyRecipesPage />
        </Route>
        <Redirect to="/" />
      </Switch>  
    </Router>
  );
}

export default App;
