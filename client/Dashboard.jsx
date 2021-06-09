import React, { useState, useEffect, useRef } from 'react';
import CryptoCard from './CryptoCard.jsx';



const Dashboard = (props) => {
    const [state, setState] = useState(Array(props.watchers.length).fill(0));

    const list = [];
    props.watchers.forEach((w, i) => list.push(<CryptoCard key={'w' + i} socket={props.socket} id={w}/>));
    
    return (
        <div className='gridContainer'>
                {list}
        </div>
    );
}

export default Dashboard;