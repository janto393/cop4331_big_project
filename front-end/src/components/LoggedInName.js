import React from 'react';

function LoggedInName()
{
    var _ud = localStorage.getItem('user_data');
    var ud = JSON.parse(_ud);
    console.log(ud);
    var firstName = ud.firstname;
    var lastName = ud.lastname;   

  return(
   <div>
   <span id="userName">{firstName} {lastName}</span>
   </div>
  );

};


export default LoggedInName;
