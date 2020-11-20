// React imports
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

// Page imports
import LoginPage from './pages/LoginPage';

// CSS imports
// import logo from './logo.svg';
import './App.css';

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
				</Switch>
			</div>
		</Router>
  );
}

export default App;
