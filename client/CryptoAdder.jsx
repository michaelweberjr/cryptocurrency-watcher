import React, { useState, useEffect } from 'react';



const addWatcher = (socket, callback) => {
  const crypto = document.getElementById('cryptoSelect').value;
  const fiat = document.getElementById('fiatSelect').value;
  socket.createWatcher(crypto, fiat, callback);
}

const removeWatchers = (socket, callback) => {
  const ids = Array.from(document.getElementsByTagName('input')).filter(cb => cb.checked).map(cb => cb.value);
  socket.removeWatchers(ids, callback);
}

const CryptoAdder = (props) => {
  // const [ state, setState ] = useState(0);
  const { socket, watchers, setWatchers } = props;

  const cryptoOptions = [];
  const fiatOptions = [];
  socket.state.cryptoList.forEach((c, i) => cryptoOptions.push(<option key={'c' + i} value={c.id}>{c.name}</option>));
  socket.state.fiatList.forEach((f, i) => fiatOptions.push(<option key={'f' + i} value={f.id}>{f.name}</option>))

  const currWatcherList = [];
  watchers.forEach((w, i) => currWatcherList.push(
      <div key={w + 'CheckBox'}>
        <input type="checkbox" id={w+'CheckBox'} name={w} value={w}></input>
        <label htmlFor={w}>{w}</label>
      </div>
    ));

  return (
      <div className="managerGrid">
        <div className="managerContainer">
          <h3>Current Watcher List:</h3>
          <div className="watcherList">
            {currWatcherList}
          </div>
          <button id="removeButton" onClick={() => removeWatchers(socket, setWatchers)}>Remove Selected</button>
        </div>
        <div className="managerContainer">
          <h3>Add Currency Watcher</h3>
          <div className="currencySelector">
            <div>
              <label htmlFor="fiatSelect">Fiat Currency</label>
              <select name="fiatelect" id="fiatSelect">{fiatOptions}</select>
            </div>
            <p>To</p>
            <div>
              <label htmlFor="cryptoSelect">Crypto Currency</label>
              <select name="cryptoSelect" id="cryptoSelect">{cryptoOptions}</select>
            </div>
          </div>
          <button id="adderButton" onClick={() => addWatcher(socket, setWatchers)}>Add Watcher</button>
        </div>
      </div>
  );
}

export default CryptoAdder;
