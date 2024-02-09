const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  username: {type: String, required: true}, 
  count: {type: Number, required: true},
  _id: {type: String, required: true},
  log: {type: [{
    description: {type: String, required: true},
    duration: {type: Number, required: true},
    date: {type: String, required: true}
  }], required: true}
});
exports.LogModel = mongoose.model("Log", logSchema);