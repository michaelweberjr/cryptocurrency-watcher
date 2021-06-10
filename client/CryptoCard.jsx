import React, { useState, useEffect } from 'react';
import CryptoChart from './CryptoChart.jsx';

const CryptoCard = (props) => {
    const { socket, id } = props;
    const product = socket.state.products[id];

    if(!product) return (<h3>Not found</h3>)
    return (
        <div className="gridBox">
            <p>{product.crypto.name} to {product.fiat.name}</p>
            <Price socket={socket} id={id}/>
            <CryptoChart socket={socket} id={id}/>
            {props.showPredictions && <Predictor socket={socket} id={id}/>}
        </div>
    );
}

const priceLowHighs = {};

const Price = (props) => {
    const [state, setState] = useState({ price:0, firstRun:true, low:0, high:0 });
    if(state.firstRun) {
        if(!priceLowHighs[props.id]) priceLowHighs[props.id] = { low:Infinity, high:-Infinity };
        props.socket.addListener(props.id, (price) => {
            const stats = priceLowHighs[props.id];
            if(price > stats.high) stats.high = price;
            if(price < stats.low) stats.low = price;

            setState({...stats, firstRun:false, price});
        });
        setState({...state, firstRun:false});
    }

    const symbol = props.socket.state.products[props.id].fiat.symbol;

    return (
        <p className='priceSpan'>
            <span className="green">High: {symbol+state.high}</span>
            <span>Price: {symbol+state.price}</span>
            <span className="red">Low: {symbol+state.low}</span>
        </p>
    );
} 

const Predictor = (props) => {
    const [state, setState] = useState(0);
    if(state === 0) {
        props.socket.state.predictors[props.id].addListener((curr, prev) => {
            setState({ curr, prev });
        });

        const curr = props.socket.state.predictors[props.id].currentPrediction;
        const prev = props.socket.state.predictors[props.id].lastPrediction;
        setState({ curr, prev });
    }

    const symbol = props.socket.state.products[props.id].fiat.symbol;

    return (
        <div>
            {state.curr && <p>Current Prediction: {symbol + Math.round(100*state.curr.price)/100} at {timeFormat(state.curr.time)}</p>}
            {state.prev && <p>Last Prediction: {symbol + Math.round(100*state.prev.price)/100} at {timeFormat(state.prev.time)}; Actual: {symbol + Math.round(100 * state.prev.actual) / 100} Diff: {symbol + Math.round(100 * state.prev.diff) / 100}</p>}
        </div>
    );
}

function timeFormat(time) {
    const date = new Date(time);
    return date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
}

export default CryptoCard;