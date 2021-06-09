import React, { useState, useEffect } from 'react';
import CryptoAdder from './CryptoAdder.jsx';
import Dashboard from './Dashboard.jsx';
import Login from './Login.jsx';
import Signup from './Signup.jsx';

var makeFetchCall = true;

function App(props) {
    const [ state, setState ] = useState({ tab:3, watchers:[] });

    useEffect(() => {
        if(makeFetchCall) {
            makeFetchCall = false;
            fetch('/session')
                .then(data => data.json())
                .then(data => {
                    console.log(data);
                })
                .catch(err => {
                    console.log('Fetch error: ', err);
                });
        }
    });

    let mainElement = null;
    if(state.tab === 0) mainElement = <Dashboard watchers={state.watchers}/>;
    else if(state.tab === 1) mainElement = <CryptoAdder state={state} setState={setState}/>;
    else if(state.tab === 2) mainElement = <Signup />;
    else if(state.tab === 3) mainElement = <Login />;

    return (
        <div>
            <div className="header">
                <span className="leftButtons">
                    <button id="dashboardBtn" onClick={() => setState({...state, tab:0})}>Dashboard</button>
                    <button id="addCryptoBtn" onClick={() => setState({...state, tab:1})}>Add Watcher</button>
                </span>
                <span className="rightButtons">
                    <button id="logOutBtn">Log Out</button>
                </span>
            </div>
            <div className="mainContainer">
                {mainElement}
            </div>
        </div>
    );
}


export default App;
