import React from 'react';

function LoggedInName()
{
    var _ud = localStorage.getItem('user_data');
    var ud = JSON.parse(_ud);
    var firstName = ud.firstName;
    var lastName = ud.lastName;   

  return(
   <div>
   <span id="userName">{firstName} {lastName}</span>
   </div>
  );

};


export default LoggedInName;
