import React from 'react';
import {Button} from 'react-bootstrap';
import './SidebarFiles/Sidebar.css';

function LoggedInName()
{
    var _ud = localStorage.getItem('user_data');
    var ud = JSON.parse(_ud);
    // var userId = ud.id;
    var firstName = ud.firstName;
    var lastName = ud.lastName;

    const doLogout = event => 
    {
      event.preventDefault();
        localStorage.removeItem("user_data")
        window.location.href = '/';
    };    

  return(
   <div id="loggedInDiv">
   <span id="userName">{firstName} {lastName}</span>
   <Button variant = "light" type="button" id="logoutButton" className="side-menu-items" 
     onClick={doLogout}> Log Out </Button>
   </div>
  );

};


export default LoggedInName;
