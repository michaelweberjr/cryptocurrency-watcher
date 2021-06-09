import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';

const CryptoCard = (props) => {
    const { socket, id } = props;
    const product = socket.state.products[id];

    if(!product) return (<h3>Not found</h3>)
    return (
        <div className="gridBox">
            <p>{product.crypto.name} to {product.fiat.name}</p>
            <p>Price: <Price socket={socket} id={id}/></p>
            <ReactChart socket={socket} id={id}/>
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

const ReactChart = (props) => {
    const [state, setState] = useState(0);
    
    useEffect(() => {
        const config = {
            type: 'line',
            options: {
                plugins: {
                    legend: {
                        display: false,
                    }
                },
                elements: {
                    point: {
                        radius: 1,
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            callback: (value, index, values) => props.socket.state.products[props.id].fiat.symbol + value
                        }
                    },
                }
            },
            data: {
                labels:[],
                datasets: [{
                    backgroundColor: 'rgb(128,200,128)',
                    borderColor: 'rgb(128,200,128)',
                    data: [],
                }]
            }
        }

        const utcTimes = [];
        const chart = new Chart(document.getElementById('watcher' + props.id), config);
        props.socket.addListener(props.id, (price, time) => {
            const date = new Date(time);
            const utcTime = date.valueOf(time);
            const formatedTime = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();

            if(!config.data.labels.length) {
                config.data.datasets[0].data.push(price);
                config.data.labels.push(formatedTime);
                chart.update();
            }
            if(config.data.labels.length && utcTime - utcTimes[utcTimes.length - 1] > 500) {
                if(config.data.labels.length === 120) {
                    config.data.labels.shift();
                    config.data.datasets[0].data.shift();
                }

                config.data.datasets[0].data.push(price);
                config.data.labels.push(formatedTime);
                utcTimes.push(utcTime);
                chart.update();
            }
            else {
                config.data.datasets[0].data[config.data.datasets[0].data.length - 1] = price;
                config.data.labels[config.data.labels.length - 1] = formatedTime;
                utcTimes[utcTimes.length - 1] = utcTime;
                chart.update();
            }
        })
    })

    return (
        <div>
            <canvas id={'watcher'+props.id}></canvas>
        </div>
    );
}



export default CryptoCard;