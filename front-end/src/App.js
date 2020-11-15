import React from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// -== Pages ==-
import RecipesPage from './pages/RecipesPage';
import MyRecipesPage from './pages/MyRecipesPage';
import IngListPage from './pages/IngListPage';
import CreateRecipePage from './pages/CreateRecipePage';
import SettingsPage from './pages/SettingsPage';

// -== SideBar Component for each page
import Sidebar from './components/SidebarFiles/Sidebar';
import LoginPage from './pages/LoginPage';

// -== SideBar Component not present for login
const LoginContainer = () => (
  <div>
      <Route path="/" exact>
          <LoginPage />
      </Route>
  </div>
)

// -== SideBar Component present for all other pages
const DefaultContainer = () => (
  <div>
    <Sidebar />
        <Route path="/recipes" exact>
          <RecipesPage />
        </Route>
        <Route path="/myrecipes" exact>
          <MyRecipesPage />
        </Route>
        <Route path="/ingredients" exact>
          <IngListPage />
        </Route>
        <Route path="/createrecipe" exact>
          <CreateRecipePage />
        </Route>
        <Route path="/accountSettings" exact>
          <SettingsPage />
        </Route>
        <Redirect to="/recipes" />
  </div>
)

function App() {
  return (
    <Router >
      <Switch>
        <Route path="/" exact>
          <LoginContainer />
        </Route>
        <Route>
          <DefaultContainer />
        </Route>
      </Switch>  
    </Router>
  );
}

export default App;
