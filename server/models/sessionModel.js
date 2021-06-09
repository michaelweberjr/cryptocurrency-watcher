const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
    ssid: { type: String, required: true, unique: true },
});

module.exports = mongoose.model("session", sessionSchema);
    