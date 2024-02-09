const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {type: String, required: true}, 
});
exports.UserModel = mongoose.model("User", userSchema);