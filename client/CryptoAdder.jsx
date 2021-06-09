import React, { useState, useEffect } from 'react';

const saveState = {};
const getCurrencies = (() => {
    function inner(callback) {
        if(!saveState.crypto) {
            fetch('https://api.pro.coinbase.com/currencies')
                .then(data => data.json())
                .then(data => {
                    saveState.fiat = data.filter(cur => cur.details.type === 'fiat').sort();
                    saveState.crypto = data.filter(cur => cur.details.type === 'crypto').sort();
                    callback(saveState);
                })
                .catch(err => console.log(JSON.stringify(err)));
        }
        else callback(saveState);
    }

    return inner;
})();

const addWatcher = (callback, state) => {
    const crypto = document.getElementById('cryptoSelect').value;
    const fiat = document.getElementById('fiatSelect').value;
    const newState = state.watchers.concat([crypto + '-' + fiat]);
    callback({...state, watchers: newState });
}

const CryptoAdder = (props) => {
    const [ state, setState ] = useState({ fiat:[], crypto:[] });

    const cryptoOptions = [];
    const fiatOptions = [];
    if(state.crypto.length === 0) getCurrencies(setState);
    else {
        state.crypto.forEach((c, i) => cryptoOptions.push(<option key={'c' + i} value={c.id}>{c.name}</option>));
        state.fiat.forEach((f, i) => fiatOptions.push(<option key={'f' + i} value={f.id}>{f.name}</option>))
    }

    return (
        <div className='adderBox'>
            <h3>Add Currency Watcher</h3>
            <div className="adderDiv">
                <div>
                    <label htmlFor="fiatSelect">Fiat Currency</label>
                    <select name="fiatelect" id="fiatSelect">{fiatOptions}</select>
                </div>
                <p>To:</p>
                <div>
                    <label htmlFor="cryptoSelect">Crypto Currency</label>
                    <select name="cryptoSelect" id="cryptoSelect">{cryptoOptions}</select>
                </div>
            </div>
            <button id="adderButton" onClick={() => addWatcher(props.setState, props.state)}>Add Watcher</button>
        </div>
    );
}

export default CryptoAdder;
