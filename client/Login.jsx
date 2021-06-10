import React, { useState, useEffect } from 'react';

const Login = (props) => {
    const [state, setState] = useState(0);

    const loginClick = () => {
        props.login(document.getElementById('usernameInput').value, document.getElementById('passwordInput').value)
    }


    return (
        <div className='boxContainer'>
            <h2>Crypto Watcher</h2>
            <h3>Login</h3>
            <label htmlFor="usernameInput">Username</label>
            <input id="usernameInput" type="text"></input>
            <label htmlFor="passwordInput">Password</label>
            <input id="passwordInput" type="password"></input>
            <button id="loginBtn" onClick={loginClick}>Login</button>
            <button id="signupBtn" onClick={props.signup}>Signup</button>
        </div>
    );
}

export default Login;