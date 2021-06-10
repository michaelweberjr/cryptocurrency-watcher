import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';

const timePriceData = {};

const CryptoChart = (props) => {
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
                            color: 'rgb(70, 120, 210)',
                            callback: (value, index, values) => props.socket.state.products[props.id].fiat.symbol + value
                        }
                    },
                    x: {
                        ticks: {
                            color: 'rgb(70, 120, 210)',
                        }
                    }
                },
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

        const chart = new Chart(document.getElementById('watcher' + props.id), config);
        props.socket.addListener(props.id, (price, time) => {
            const date = new Date(time);
            const utcTime = date.valueOf(time);
            const formatedTime = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
            
            if(!timePriceData[props.id]) timePriceData[props.id] = {utcTime:0, prices:[], formatedTimes:[]};
            const data = timePriceData[props.id];

            if(!data.prices.length || utcTime - data.utcTime > 500) {
                if(data.prices.length === 120) {
                    data.prices.shift();
                    data.formatedTimes.shift();
                }

                data.prices.push(price);
                data.formatedTimes.push(formatedTime);
                data.utcTime = utcTime;
            }
            else {
                data.prices[data.prices.length - 1] = price;
                data.formatedTimes[data.formatedTimes - 1] = formatedTime;
            }

            config.data.datasets[0].data = data.prices;
            config.data.labels = data.formatedTimes;
            chart.update();
        })
    })

    return (
        <div>
            <canvas id={'watcher'+props.id}></canvas>
        </div>
    );
}

export default CryptoChart