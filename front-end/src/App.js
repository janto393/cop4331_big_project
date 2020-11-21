// React imports
import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';

// CSS imports
// import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// -== Pages ==-
import RecipesPage from './pages/RecipesPage';
import MyRecipesPage from './pages/MyRecipesPage';
import IngListPage from './pages/IngListPage';
import CreateRecipePage from './pages/CreateRecipePage';
import SettingsPage from './pages/SettingsPage';
import CreateAccount from './components/CreateAccount';

// -== SideBar Component for each page
import Sidebar from './components/SidebarFiles/Sidebar';
import LoginPage from './pages/LoginPage';


// -== SideBar Component present for all other pages
const DefaultContainer = () => (
  <div className="pages">
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

function App()
{
  return (
    <Router>
				<Switch>
          <Route path="/" exact>
            <LoginPage />
          </Route>
          <Route path="/register" exact>
            <CreateAccount />
          </Route>
          <Route>
            <DefaultContainer />
          </Route>
				</Switch>
		</Router>
  );
}

export default App;
