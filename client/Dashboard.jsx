import React, { useState, useEffect, useRef } from 'react';
import CryptoCard from './CryptoCard.jsx';



const Dashboard = (props) => {
    const [state, setState] = useState(Array(props.watchers.length).fill(0));

    const list = [];
    props.watchers.forEach((w, i) => list.push(<CryptoCard key={'w' + i} socket={props.socket} id={w} showPredictions={props.showPredictions}/>));
    
    if(list.length === 0) list.push(<h3>You don't have any watchers, click 'manage' to add some.</h3>);

    return (
        <div className='gridContainer'>
            {list}
        </div>
    );
}

export default Dashboard;