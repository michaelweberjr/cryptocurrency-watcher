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
                tensor.model.compile({loss: 'meanSquaredError', optimizer: 'sgd'});
                tensor.xs = [];
                tensor.ys = [];
            }
            else tensor = tensors[req.body.id];

            tensor.xs = tensor.xs.concat(req.body.timeStamps.map(t => Number(t)));
            tensor.ys = tensor.ys.concat(req.body.prices.map(p => Number(p)));

            const xs = tf.tensor1d(tensor.xs);
            const ys = tf.tensor1d(tensor.ys);
            console.log('starting model fit');
            const promise = await tensor.model.fit(xs, ys);
            console.log('promise status: ', promise);
            const predictTime = tensor.xs[tensor.xs.length - 1] + 30 * 1000;
            const predictPrice = tensor.model.predict(tf.tensor2d([predictTime], [1,1])).dataSync()[0];
            console.log(`${req.body.id} predicted ${predictPrice} at ${predictTime}`);
            res.locals = { time:predictTime, price:predictPrice };
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