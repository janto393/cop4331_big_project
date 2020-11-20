// React imports
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

// Page imports
import LoginPage from './pages/LoginPage';

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

// -== SideBar Component for each page
import Sidebar from './components/SidebarFiles/Sidebar';
import LoginPage from './pages/LoginPage';

// -== SideBar Component not present for login
const LoginContainer = () => (
  <div>
      <Route path="/" exact>
						<div className="dialog-container-div">
							<div className="login-dialog">
								<div className="logo"></div>
								<div className="login-page-div">
									<LoginPage state={state} />
									<p className="register-click" onClick={handleClick}>{message}</p>
								</div>
							</div>
						</div>
					</Route>
  </div>
)

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
	// boolean hook to determine whether the Login or the CreateAccount component will be rendered
	const [state, setState] = useState(true);
	
	// string hook that will hold the register/create account link in the loginpage
	const [message, setMessage] = useState('Create an Account');

	// loginState handlers
	const handleClick = () => {
		setState(!state);
		formMessage();
	}

	const formMessage = (e) => {
		(state === true) ? setMessage('Return to Login') : setMessage('Create an Account');
	}

  return (
    <Router >
			<div className="page-container">
				<Switch>
          <Route path="/" exact>
            <LoginContainer />
          </Route>
          <Route>
            <DefaultContainer />
          </Route>
				</Switch>
			</div>
		</Router>
  );
}

export default App;
