import React from 'react';

function LoggedInName()
{
	var userData = JSON.parse(localStorage.getItem('user_data'));	
	var firstname = userData.firstname;
	var lastname = userData.lastname;   

  return(
   <div>
   	<span id="username">{firstname} {lastname}</span>
   </div>
  );

};


export default LoggedInName;
