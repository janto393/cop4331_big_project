import React from 'react';

function LoggedInName()
{
	// try catch so code doen't throw typeError on logout
	try
	{
		var userData = JSON.parse(localStorage.getItem('user_data'));
		var firstname = userData.firstname;
		var lastname = userData.lastname;
	}
	catch (e)
	{

	}

  return(
   <div>
   	<span id="username">{firstname} {lastname}</span>
   </div>
  );

};


export default LoggedInName;
