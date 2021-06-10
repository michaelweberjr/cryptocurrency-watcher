import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';

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

export default CryptoChart