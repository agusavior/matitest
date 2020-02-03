var express = require('express');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var app = express();

const MONGO_ATLAS_PASSWORD = 'aWCS8CGePfYkF0dgaFod';

const User = require('./models/user');
const Task = require('./models/task');

mongoose.connect(
    'mongodb+srv://mati-test-user0:' + MONGO_ATLAS_PASSWORD + '@matitestcluster-nfoij.mongodb.net/test?retryWrites=true&w=majority',
    { useNewUrlParser: true, useUnifiedTopology: true }
).catch(error => console.log(error));

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Conectado a MongoDB!');
});

app.get('/login', function (req, res) {
    User.findOne({username: req.query.user}).exec(function (err, user) {
        if(user) {
            //res.status(200).send('Ok.\nToken: ' + user.token + '\nName:' + user.name);
            if(user.pass === req.query.pass) {
                res.status(200).json({
                    token: user.token,
                    name: user.name
                });
            } else {
                res.status(400).json({ message: 'Invalid password' });
            }

        } else {
            res.status(400).json({ message: 'Username does not exist' });
        }
    });
});

// Retorna un número muy grande al azar.
function generateRandomToken() {
    return Math.floor(Math.random() * 1000000000000000);
}

app.get('/register', function (req, res) {
    // jwt.sign({user: req.query.user, pass: req.query.pass}, 'secretkey', (err, token) => {
    //     console.log(token);
    // });
    User.findOne({username: req.query.user}).exec(function (err, user) {
        if(user) {
            res.status(400).json({ message: 'User already exists', user: user });
        } else {

            const user = new User({
                _id: new mongoose.Types.ObjectId(),
                username: req.query.user,
                pass: req.query.pass,
                name: req.query.name,
                token: generateRandomToken()
            });
            user.save().then(result => {
                console.log('Nuevo usuario', result);
            }).catch(err => console.log(err));
            res.status(200).json({ message: 'User created' });
        }
    });
});

function assertToken(req, res, next) {
    User.findOne({token: parseInt(req.params.token)}).exec(function (err, user) {
        if(user) {
            next();
        } else {
            res.status(401).json({ message: 'Invalid Token' });
        }
    });
}

app.get('/token/:token/getAllTasks', assertToken, function (req, res) {
    Task.find().exec().then(docs => {
        res.status(200).json(docs);
    })
    .catch(err => {
        res.status(500).json({
            error: err,
        });
    });
});

app.get('/token/:token/createTask', assertToken, function (req, res) {
    
    const task = new Task({
        _id: new mongoose.Types.ObjectId(),
        title: req.query.title,
        stars: parseInt(req.query.stars),
        done: (req.query.done == 'true'),
        color: req.query.color
    });
    task.save().then(result => {
        console.log('Nuevo usuario', result);
    }).catch(err => console.log(err));

    res.status(200).json({ task: task });
});

app.get('/token/:token/modifyTask/:id', assertToken, function (req, res) {
    Task.findByIdAndUpdate(req.params.id, {
        title: req.query.title,
        stars: parseInt(req.query.stars),
        done: (req.query.done == 'true'),
        color: req.query.color
    }, {new: true}, function(err, model) {
        if(model) {
            res.status(200).json( model );
        } else {
            res.status(400).json({ message: 'There are not tasks with that id' });
        }
    });
});


app.get('/token/:token/getTask/:id', assertToken, function (req, res) {
    Task.findById(req.params.id).exec(function (err, task) {
        if(task) {
            res.status(200).json(task);
        } else {
            res.status(400).json({ message: 'There are not tasks with that id' });
        }
    });
});

app.get('/token/:token/removeTask/:id', assertToken, function (req, res) {
    Task.findByIdAndDelete(req.params.id).exec(function (err, doc) {
        if(doc) {
            res.status(200).json({ message: 'Deleted', doc: doc, err: err });
        } else {
            res.status(400).json({ message: 'There are not tasks with that id', doc: doc, err: err });
        }
    });
});

app.get('/users', function (req, res) {
    User.find()
        .exec()
        .then(docs => {
            console.log(docs);
            res.status(200).json(docs);
        })
        .catch(err => {
            res.status(500).json({
                error: err,
            });
        });

    //console.log('req.body.id:', req.query.id);
    //const user = User.findById(req.query.id);
    //res.send(user);
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});