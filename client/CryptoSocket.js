const baseURL = 'https://api.pro.coinbase.com/currencies'
const socketURL = 'wss://ws-feed.pro.coinbase.com';

var cbSocket = null;
var currWatchers = [];
const useSocket = (state) => {
  if(state.watchers.length && cbSocket === null) {
    cbSocket = new WebSocket(socketURL);
    cbSocket.onopen = (e) => {
      const subscriber = {
          type: "subscribe",
          product_ids: state.watchers,
          channels: ["ticker"]
      };

      cbSocket.send(JSON.stringify(subscriber));
    };
    currWatchers = [...state.watchers];

    cbSocket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if(data.type === 'ticker') {
        const product = state.products[data.product_id];
        product.price = data.price;
        product.listeners.forEach(cb => cb(data.price, data.time));
      }
    };

  }
  else if(state.watchers.length === 0) {
    closeSocket();
  }
  else if(state.watchers.length !== currWatchers.length) {
    cbSocket.onmessage = null;

    let subscriber = {
      type: "unsubscribe",
      product_ids: currWatchers,
      channels: ["ticker"]
    }
    cbSocket.send(JSON.stringify(subscriber));
    currWatchers = [...state.watchers];

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
            const product = state.products[data.product_id];
            product.price = data.price;
            product.listeners.forEach(cb => cb(data.price, data.time));
          }
        };
      }
    };
  }
}

function closeSocket() {
  if(cbSocket !== null) {
    cbSocket.close();
    cbSocket = null;
    currWatchers = [];
  }
}

class CryptoSocket {
  constructor() {
    this.state = {
      watchers: [],
      products: {},
      socket: null,
      loaded: false,
      predictors: {},
    };
    fetch(baseURL)
    .then(data => data.json())
    .then(data => {
        this.state.fiatList = data.filter(cur => cur.details.type === 'fiat').sort((a, b) => a.name < b.name);
        this.state.cryptoList = data.filter(cur => cur.details.type === 'crypto').sort((a, b) => a.name > b.name);
        this.state.loaded = true;
    })
    .catch(err => console.log(JSON.stringify(err)));
  }

  createWatcher(cryptoId, fiatId, callback) {
    const product = {
      price: -1,
      listeners: []
    };

    for(let i = 0; i < this.state.cryptoList.length; i++) {
      if(this.state.cryptoList[i].id === cryptoId) {
        product.crypto = {
          id: this.state.cryptoList[i].id,
          name: this.state.cryptoList[i].name,
        }
        break;
      }
    }

    for(let i = 0; i < this.state.fiatList.length; i++) {
      if(this.state.fiatList[i].id === fiatId) {
        product.fiat = {
          id: this.state.fiatList[i].id,
          name: this.state.fiatList[i].name,
          symbol: this.state.fiatList[i].details.symbol,
        }
        break;
      }
    }

    product.id = product.crypto.id + '-' + product.fiat.id
    if(!this.state.products[product.id]) {
      this.state.products[product.id] = product;
      this.state.predictors[product.id] = new Predictor(product.id, this);
    }

    if(!this.state.watchers.includes(product.id)) {
      this.state.watchers.push(product.id);
      useSocket(this.state);
      callback(this.state.watchers);
    }
  }

  setWatchers(ids) {
    ids.forEach(id => {
      const [cryptoId, fiatId] = id.split('-');

      const product = {
        price: -1,
        listeners: []
      };
  
      for(let i = 0; i < this.state.cryptoList.length; i++) {
        if(this.state.cryptoList[i].id === cryptoId) {
          product.crypto = {
            id: this.state.cryptoList[i].id,
            name: this.state.cryptoList[i].name,
          }
          break;
        }
      }
  
      for(let i = 0; i < this.state.fiatList.length; i++) {
        if(this.state.fiatList[i].id === fiatId) {
          product.fiat = {
            id: this.state.fiatList[i].id,
            name: this.state.fiatList[i].name,
            symbol: this.state.fiatList[i].details.symbol,
          }
          break;
        }
      }
  
      product.id = product.crypto.id + '-' + product.fiat.id
      this.state.watchers.push(product.id);
      this.state.products[product.id] = product;
      this.state.predictors[product.id] = new Predictor(product.id, this);
    });

    useSocket(this.state);
  }

  removeWatchers(ids, callback) {
    const indexes = ids.map(id => this.state.watchers.indexOf(id));
    this.state.watchers = this.state.watchers.filter((w, i) => !indexes.includes(i));
    ids.forEach(id => this.state.products[id].listeners = []);
    useSocket(this.state);
    callback(this.state.watchers);
  }

  addListener(id, callback) {
    this.state.products[id].listeners.push(callback);
  }
}

class Predictor {
  constructor(id, socket) {
    this.events = { id, prices:[], timeStamps:[] };
    this.listeners = [];
    this.lastPrediction = null;
    this.currentPrediction = null;
    this.waiting = false;

    socket.addListener(id, this.batchEvents.bind(this));
  }

  batchEvents(price, time) {
    const utcTime = Date.parse(time);
    this.events.prices.push(price);
    this.events.timeStamps.push(utcTime);

    if(this.currentPrediction && !this.waiting) {
      if(utcTime >= this.currentPrediction.time) {
        this.getPrediction();
      }
    }
  }

  addListener(callback) {
    this.listeners.push(callback);
    if(!this.currentPrediction) setTimeout(this.getPrediction.bind(this), 1000);
  }

  getPrediction() {
    const lastPrice = this.events.prices[this.events.prices.length - 1];
    this.waiting = true;
    fetch(`/tensor`, { method: 'POST', 
            headers: {
                'Content-Type': 'Application/JSON'
            }, 
            body: JSON.stringify(this.events) })
            .then(data => data.json())
            .then(data => {
                this.lastPrediction = this.currentPrediction;
                if(this.lastPrediction) {
                  this.lastPrediction.actual = lastPrice;
                  this.lastPrediction.diff = Math.abs(lastPrice - this.lastPrediction.price);
                }
                this.currentPrediction = data;
                this.listeners.forEach(callback => callback(this.currentPrediction, this.lastPrediction));
                this.waiting = false;
            })
            .catch(err => {
                console.log('Fetch error: ', err);
            });

    this.events.prices = [];
    this.events.timeStamps = [];
  }
}


export default CryptoSocket;
export { closeSocket };