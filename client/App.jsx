import React, { useState, useEffect } from 'react';
import CryptoAdder from './CryptoAdder.jsx';
import CryptoSocket from './CryptoSocket.js';
import Dashboard from './Dashboard.jsx';
import Login from './Login.jsx';
import Signup from './Signup.jsx';
import { closeSocket } from './CryptoSocket.js';

var makeFetchCall = true;

function App(props) {
    const [ state, setState ] = useState({ tab:69, watchers:[] });

    useEffect(() => {
        const loading = () => {
            if(props.socket.state.loaded) {
                if(makeFetchCall) {
                    makeFetchCall = false;
                    fetch('/session')
                        .then(data => data.json())
                        .then(data => {
                            props.socket.setWatchers(data.watchers);
                            setState(data);
                        })
                        .catch(err => {
                            console.log('Fetch error: ', err);
                        });
                }
            }
            else setTimeout(loading, 100);
        };

        loading();
    });

    const setWatchers = (watchers) => {
        fetch(`/watcher`, { method: 'POST', 
            headers: {
                'Content-Type': 'Application/JSON'
            }, 
            body: JSON.stringify(watchers) })
            .then(data => data.json())
            .then(data => {
                setState(data);
            })
            .catch(err => {
                console.log('Fetch error: ', err);
            });
    }

    const setTab = (tab) => {
        if(state.tab != tab)
            setState({...state, tab});
    }

    const logOut = () => {
        closeSocket();
        props.socket.state.watchers = [];
        fetch(`/logout`, { method: 'POST'})
            .then(data => data.json())
            .then(data => {
                setState(data);
            })
            .catch(err => {
                console.log('Fetch error: ', err);
            });
    }

    const logIn = (username, password) => {
        fetch(`/login?username=${username}&password=${password}`)
            .then(data => data.json())
            .then(data => {
                props.socket.setWatchers(data.watchers);
                setState(data);
            })
            .catch(err => {
                console.log('Fetch error: ', err);
            });
    }

    const signUp = (username, password) => {
        fetch(`/signup?username=${username}&password=${password}`, { method: 'POST'})
            .then(data => data.json())
            .then(data => {
                setState(data);
            })
            .catch(err => {
                console.log('Fetch error: ', err);
            });
    }

    let mainElement = null;
    if(state.tab === 0) mainElement = <Dashboard watchers={state.watchers} socket={props.socket}/>;
    else if(state.tab === 1) mainElement = <CryptoAdder  watchers={state.watchers} socket={props.socket} setWatchers={setWatchers}/>;
    else if(state.tab === 2) mainElement = <Signup signup={signUp}/>;
    else if(state.tab === 3) mainElement = <Login login={logIn} signup={() => setTab(2)}/>;
    else if(state.tab === 69) mainElement = <h2>Loading...</h2>;

    return (
        <div>
            {state.tab < 2 && <div className="header">
                <span className="leftButtons">
                    <button id="dashboardBtn" onClick={() => setTab(0)}>Dashboard</button>
                    <button id="addCryptoBtn" onClick={() => setTab(1)}>Manage</button>
                </span>
                <span className="rightButtons">
                    <button id="logOutBtn" onClick={logOut}>Log Out</button>
                </span>
            </div>}
            <div className="mainContainer">
                {mainElement}
            </div>
        </div>
    );
}


export default App;
