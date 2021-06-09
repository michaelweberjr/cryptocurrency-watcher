import React, { useState, useEffect } from 'react';

const Signup = (props) => {
    const [state, setState] = useState(0);

    const signupClick = () => {
        props.signup(document.getElementById('usernameInput').value, document.getElementById('passwordInput').value)
    }


    return (
        <div className='boxContainer'>
            <h3>Create Account</h3>
            <label htmlFor="usernameInput">Username</label>
            <input id="usernameInput" type="text"></input>
            <label htmlFor="passwordInput">Password</label>
            <input id="passwordInput" type="password"></input>
            <button id="signupBtn" onClick={signupClick}>Signup</button>
        </div>
    );
}

export default Signup;