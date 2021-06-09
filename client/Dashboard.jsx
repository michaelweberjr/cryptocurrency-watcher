import React, { useState, useEffect, useRef } from 'react';
import CryptoCard from './CryptoCard.jsx';

var cbSocket = null;
var currWatchers = null;
var prices = [];

const useSocket = async (watchers, state, callback) => {
    if(cbSocket === null) {
        cbSocket = new WebSocket('wss://ws-feed.pro.coinbase.com');
        currWatchers = watchers;
        prices = state;
        cbSocket.onopen = (e) => {
            const subscriber = {
                type: "subscribe",
                product_ids: currWatchers,
                channels: ["ticker"]
            };

            cbSocket.send(JSON.stringify(subscriber));
        };

        cbSocket.onmessage = (e) => {
            const data = JSON.parse(e.data);
            if(data.type === 'ticker') {
                const index = currWatchers.indexOf(data.product_id);
                prices = prices.map((p, i) => i === index ? data.price : p);
                callback(prices);
            }
        };

    }
    else if(watchers.length !== currWatchers.length) {
        cbSocket.onmessage = null;

        let subscriber = {
            type: "unsubscribe",
            product_ids: currWatchers,
            channels: ["ticker"]
        }
        cbSocket.send(JSON.stringify(subscriber));
        currWatchers = watchers;
        prices = state;

        cbSocket.onmessage = (e) => {
            const data = JSON.parse(e.data);
            if(data.type === "subscriptions") {
                subscriber = {
                    type: "subscribe",
                    product_ids: currWatchers,
                    channels: ["ticker"]
                }
                cbSocket.send(JSON.stringify(subscriber));

                cbSocket.onmessage = (e) => {
                    const data = JSON.parse(e.data);
                    if(data.type === 'ticker') {
                        const index = currWatchers.indexOf(data.product_id);
                        prices = prices.map((p, i) => i === index ? data.price : p);
                        callback(prices);
                    }
                };
            }
        };
    }
}

const Dashboard = (props) => {
    const [state, setState] = useState(Array(props.watchers.length).fill(0));

    const list = [];
    props.watchers.forEach((w, i) => list.push(<li key={'w' + i}>{w}: ${state[i]}</li>));

    useEffect(() => {
        if(props.watchers.length) useSocket(props.watchers, state, setState);
    });

    return (
        <div>
            <h1>Watchers:</h1>
            <p>
                {list}
            </p>
        </div>
    );
}

export default Dashboard;