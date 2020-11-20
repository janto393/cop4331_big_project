import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Grid from 'react-bootstrap/Container';

function Login()
{
    
    var loginName;
    var loginPassword;

    const [message,setMessage] = useState('');
    function buildPath(route)
{
    // if (process.env.NODE_ENV === 'production') 
    // {
    //     return 'https://' + app_name +  '.herokuapp.com/' + route;
    // }
    // else
    // {        
        return 'http://localhost:5000' + route;
    // }
}


    const doLogin = async event => 
    {
        event.preventDefault();

        var obj = {username:loginName.value,password:loginPassword.value};
        var js = JSON.stringify(obj);

        try
        {    
            const response = await fetch(buildPath('/login'),
                {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});

            var res = JSON.parse(await response.text());
            console.log(res);

            if( res.userID <= 0 )
            {
                setMessage('User/Password combination incorrect');
            }
            else
            {
                var user = {firstName:res.firstName,lastName:res.lastName,userId:res.userID}
                localStorage.setItem('user_data', JSON.stringify(user));
                console.log(user);

                setMessage('');
                window.location.href = '/recipes';
            }
        }
        catch(e)
        {
            alert(e.toString());
            return;
        }    
    };

    return(
        <Grid>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <h1 component="h1" >
            Sign in
          </h1>
          <Form onSubmit={doLogin}>
                <Form.Control required type="username" placeholder="Username" ref={(c) => loginName = c} />
                <Form.Control required type="password" placeholder="Password" ref={(c) => loginPassword = c}/>
                <Button type="submit" variant="primary" onClick={doLogin} >
                Sign In
                </Button>
            <Grid>
                <Link to="/">
                  {"Don't have an account? Sign Up"}
                </Link>
            </Grid>
            <span id="loginResult">{message}</span>
          </Form>
        </div>
    </Grid>
    );
};

export default Login;
