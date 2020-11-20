// React imports
import React from 'react';

// CSS imports
import './LoginPage.css';

// Component imports
import Login from '../components/Login';
import CreateAccount from '../components/CreateAccount';

const LoginPage = ({state}) => {

	return (
		<div>
			{state ? <Login /> : <CreateAccount />}
		</div>
	);
};

export default LoginPage;
