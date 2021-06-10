import React, { useState, useEffect } from 'react';
import CryptoChart from './CryptoChart.jsx';

const CryptoCard = (props) => {
    const { socket, id } = props;
    const product = socket.state.products[id];

    if(!product) return (<h3>Not found</h3>)
    return (
        <div className="gridBox">
            <p>{product.crypto.name} to {product.fiat.name}</p>
            <p>Price: <Price socket={socket} id={id}/></p>
            <CryptoChart socket={socket} id={id}/>
            <Predictor socket={socket} id={id}/>
        </div>
    );
}

const Price = (props) => {
    const [state, setState] = useState({ price:0, firstRun:true });
    if(state.firstRun) {
        props.socket.addListener(props.id, (price) => setState({ firstRun:false, price}));
        setState({...state, firstRun:false});
    }

    const symbol = props.socket.state.products[props.id].fiat.symbol;

    return (
        <span>{symbol+state.price.toString(2)}</span>
    );
} 

const Predictor = (props) => {
    const [state, setState] = useState(0);
    if(state === 0) {
        props.socket.state.predictors[props.id].addListener((curr, prev) => {
            setState({ curr, prev });
        });
    }

    const symbol = props.socket.state.products[props.id].fiat.symbol;

    return (
        <div>
            {state.curr && <p>Current Prediction: {symbol + Math.round(100*state.curr.price)/100} at {timeFormat(state.curr.time)}</p>}
            {state.prev && <p>Last Prediction: {symbol + Math.round(100*state.curr.price)/100} at {timeFormat(state.prev.time)}; Actual: {symbol + state.prev.actual} Diff: {symbol + state.prev.diff}</p>}
        </div>
    );
}

function timeFormat(time) {
    const date = new Date(time);
    return date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
}

export default CryptoCard;