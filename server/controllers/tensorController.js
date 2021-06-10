const tf = require('@tensorflow/tfjs-node');
//import * as tf from '@tensorflow/tfjs-node';

const tensorController = {};

const tensors = {}

tensorController.getPrediction = async (req, res, next) => {
    if(!req.body.id || !req.body.prices || !req.body.timeStamps) {
        return next({
            log: 'Error in tenosrController.getPrediction: request body is missing information',
            message: 'Error in tenosrController.getPrediction: request body is missing information'
        });
    }
    else {
        try {
            console.log('starting prediction models')
            let tensor;
            if(!tensors[req.body.id]) {
                tensor = {};
                tensor.model = tf.sequential();
                tensor.model.add(tf.layers.dense({units: 1, inputShape: [1]}));
                tensor.model.compile({loss: 'meanSquaredError', optimizer: tf.train.adam()}); //'sgd'
                tensor.xs = [];
                tensor.ys = [];

                tensor.xMin = req.body.timeStamps[0];
                tensor.xMax = -Infinity;
                tensor.yMin = -Infinity;
                tensor.yMax = Infinity;
            }
            else tensor = tensors[req.body.id];

            // time factor for normalizing
            const factor = 1000000000000;

            tensor.xs = tensor.xs.concat(req.body.timeStamps.map(t => Number(t)/factor));
            tensor.ys = tensor.ys.concat(req.body.prices.map(p => Number(p)));

            const xs = tf.tensor1d(tensor.xs);
            const ys = tf.tensor1d(tensor.ys);
            console.log('starting model fit');
            await tensor.model.fit(xs, ys);
            
            const predictTime = tensor.xs[tensor.xs.length - 1] + (30 * 1000)/factor;
            const lastPrice = tensor.ys[tensor.ys.length - 1];
            const data = await tensor.model.predict(tf.tensor2d([predictTime], [1,1]))
            const predictPrice = Array.from(data.dataSync())[0];
            console.log(`${req.body.id} predicted ${predictPrice} at ${predictTime}`);
            res.locals = { time:predictTime*factor, price:predictPrice + lastPrice };
            return next();
        }
        catch(err) {
            return next({
                log: 'Error in tenosrController.getPrediction: ' + err,
                message: 'Error in tenosrController.getPrediction: internal server error, check the logs'
            });
        }
    }
}

module.exports = tensorController;