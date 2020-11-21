import React from 'react';
import Button from 'react-bootstrap/Button';
import './SidebarFiles/Sidebar.css';

function Logout()
{
	const doLogout = event => 
	{
		event.preventDefault();
		window.location.href = '/';
		localStorage.removeItem('user_data')
	};

  return(
    <div>
			<Button variant = "light" id="logoutButton" className="side-menu-items" onClick={ doLogout }> Log Out </Button>
   </div>
  );

};

export default Logout;
