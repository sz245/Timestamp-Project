const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config({ path: './sample.env'});
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Mongodb and Moongoose
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(error => {
    console.error('Error connecting to MongoDB:', error);
  });

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Middleware for parsing request bodies JSON data
app.use(bodyParser.urlencoded({extended: false}));

// API Endpoints
//Create username endpoints
const User = require("./Models/user.js").UserModel;
let userPost = null;

app.post('/api/users', async (req, res, next) => {
  const findUser = await User.findOne({username: req.body.username}).select('-__v');

  if (findUser){
    userPost = findUser;
  } else {
    userPost = {
      username: req.body.username, 
    }
    const new_id = await new User(userPost).save();
    userPost._id = new_id._id;
  }
  res.json(userPost);
  next();
});

app.get('/api/users', async (req, res) => {
  if (userPost){
    res.json(userPost);
  } else {
    const Users = await User.find({});
    res.json(Users);
  }
  userPost = null;
});


// Add logs endpoints
const Log = require("./Models/log.js").LogModel;
let logPost;
app.post('/api/users/:_id/exercises', async (req, res, next) => {
  const findUser = await User.findById(req.params['_id']);
  if (findUser){
    const findLog = await Log.findById(req.params['_id']);
    if (findLog == null) {
      new Log({
        username: findUser.username, 
        count: 1,
        _id: req.params['_id'],
        log: [{
          description: req.body.description,
          duration: parseInt(req.body.duration),
          date: req.body.date ? new Date(req.body.date).toDateString() : new Date().toDateString()
        }]
      }).save();
    } else {
      findLog.log.push({
        description: req.body.description,
        duration: parseInt(req.body.duration),
        date: req.body.date ? new Date(req.body.date).toDateString() : new Date().toDateString()
      });
      findLog.count = findLog.log.length;
      findLog.save();
    }
    logPost = {
      _id: findUser['_id'],
      username: findUser.username,
      description: req.body.description,
      duration: parseInt(req.body.duration),
      date: req.body.date ? new Date(req.body.date).toDateString() : new Date().toDateString()
    };
  } else {
    logPost = {error: 'no user'};
  }
  res.json(logPost);
  next();
});

app.get('/api/users/:_id/exercises', (req, res) => {
  res.json(logPost);
  logPost = null;
});


// Get logs endpoints
app.get('/api/users/:_id/logs', async (req, res) => {
  const exerciseLog = await Log.findOne({'_id': req.params['_id']}).select('-__v');
  if (Object.keys(req.query).length > 0) {
    if (req.query.from) {
      exerciseLog.log = exerciseLog.log.filter(exercise => new Date(exercise.date) >= new Date(req.query.from));
    }
    if (req.query.to) {
      exerciseLog.log = exerciseLog.log.filter(exercise => new Date(exercise.date) <= new Date(req.query.to));
    }
    if (req.query.limit) {
      exerciseLog.log = exerciseLog.log.slice(0, req.query.limit);
    }
  }
  res.json(exerciseLog);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
