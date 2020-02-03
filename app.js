var express = require('express');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var app = express();

const MONGO_ATLAS_PASSWORD = 'aWCS8CGePfYkF0dgaFod';

const User = require('./models/user');

mongoose.connect(
    'mongodb+srv://mati-test-user0:' + MONGO_ATLAS_PASSWORD + '@matitestcluster-nfoij.mongodb.net/test?retryWrites=true&w=majority',
    { useNewUrlParser: true, useUnifiedTopology: true }
).catch(error => console.log(error));

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Conectado a MongoDB!');
});

// app.get('/token/:token/getAllTasks', assertToken, function (req, res) {

//     res.send(req.params.token);

// });

// assertToken

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
    return Math.floor(Math.random() * 1000000000000);
}

app.get('/register', function (req, res) {
    // jwt.sign({user: req.query.user, pass: req.query.pass}, 'secretkey', (err, token) => {
    //     console.log(token);
    // });
    User.findOne({username: req.query.user}).exec(function (err, user) {
        if(user) {
            res.status(400).json({ message: 'User already exists' });
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
    // .then(docs => {
    //     if(docs === []) {
    //         console.log('No habia usuarios con ese nombre.')
    //         res.status(200).json(docs);
    //     } else {
    //         res.status(400).json(docs);
    //     }
    //     console.log(docs);
    //     res.status(200).json(docs);
    // })
    // .catch(err => {
    //     console.log(err);
    //     res.status(500).json({
    //         error: err,
    //     });
    // });



    //res.send('Ok');

    

    /*
    res.status(201).json({
        message: 'Este es un mensaje de Okey',
        userRegistered: user,
    });
    res.send('user: ' + req.params.user + '\npass: ' + req.params.pass + '\nname: ' + req.params.name);
    */
});

app.get('/users', function (req, res) {
    User.find()
        .exec()
        .then(docs => {
            console.log(docs);
            res.status(200).json(docs);
        })
        .catch(err => {
            console.log(err);
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