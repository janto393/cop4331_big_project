import React from 'react';
import {Button} from 'react-bootstrap';
import './SidebarFiles/Sidebar.css';

function Logout()
{
    const doLogout = event => 
    {
      event.preventDefault();
        localStorage.removeItem("user_data")
        window.location.href = '/';
    };    

  return(
    <div>
        <Button variant = "light" id="logoutButton" className="side-menu-items" 
            onClick={doLogout}> Log Out </Button>
   </div>
  );

};


export default Logout;
