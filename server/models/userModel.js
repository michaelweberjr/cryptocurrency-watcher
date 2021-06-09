const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const SALT_WORK_FACTOR = 10;

const { mangle } = JSON.parse(fs.readFileSync(path.join(__dirname, '../../dist/config.json')));

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  watchers: [ String ],
});

// userSchema.pre("save", function (next) {
//   bcrypt
//     .hash(this.password + mangle, SALT_WORK_FACTOR)
//     .then((hash) => {
//       this.password = hash;
//       next();
//     })
//     .catch((err) => {
//       console.log(err);
//       next(err);
//     });
// });

userSchema.methods.comparePassword = function (password, callback) {
  bcrypt.compare(password + mangle, this.password, function (err, isMatch) {
    if (err) return callback(err);
    else return callback(null, isMatch);
  });
};

module.exports = mongoose.model("user", userSchema);
    