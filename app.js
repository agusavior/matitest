var express = require('express');
var mongoose = require('mongoose');
var app = express();
var bodyParser = require('body-parser');
var tokenizer = require('./tokenizer');

// Constantes:
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

// Esto es porque no podia enviar un body sin esto.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/ping', function (req, res) {
    return res.status(200).send('pong');
});

app.get('/secretping', tokenizer.check, function (req, res) {
    return res.status(200).send('secretpong');
});

app.get('/login', async function (req, res) {
    const user = await User.findOne({username: req.query.user});
    
    console.log('user', user, req.body)

    if(user == undefined) {
        return res.status(409).json({ message: 'No user finded.' });
    }

    if(req.body == undefined) {
        return res.status(409).json({ message: 'Undefined body.' });
    }

    if(user.pass != req.body.pass) {
        console.log(user.pass, '!=' , req.body.pass)
        return res.status(401).json({ message: 'Unauthorized.' });
    }

    // Generamos el token, solo con el ID del usuario
    const token =  tokenizer.sign({
        userId: user._id,
    });

    return res.status(201).json({ message: 'Login successful.', token, name: user.name });
});

app.post('/register', async function (req, res) {
    const user = new User(req.body);
    try {
        await user.save();
        res.status(200).json({ message: 'User registered successfully.' });
    } catch(err) {
        res.status(400).json({ message: err.message });
    }
    return;
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
            });
            user.save().then(result => {
                console.log('Nuevo usuario', result);
            }).catch(err => console.log(err));
            res.status(200).json({ message: 'User created' });
        }
    });
});

app.get('/getAllTasks', tokenizer.check, function (req, res) {
    Task.find().exec().then(docs => {
        res.status(200).json(docs);
    })
    .catch(err => {
        res.status(500).json({
            error: err,
        });
    });
});

app.post('/createTask', tokenizer.check, async function (req, res) {
    const task = new Task(req.body);
    try {
        await task.save();
        res.status(200).json({ message: 'Created successfully.', task: task });
    } catch(err) {
        res.status(400).json({ message: 'Invalid format.' });
    }
});

// Este es un middleware para verificar que la ID del Task tiene el formato correcto para
// ser admitido por mongoose.
const checkValidId = (req, res, next) => {
    if(!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: 'Bad id.' });
    }
    next();
}

// Este es un middleware que obtiene el task y lo guarda en req.task para
// ser usado posteriormente.
const getTask = async (req, res, next) => {
    const task = await Task.findById(req.params.id);

    // Si no existe el task con dicha ID, avisa.
    if(!task) {
        return res.status(400).json({ message: 'There are not tasks with that id.' });
    }

    req.task = task;

    next();
}


app.get('/getTask/:id', tokenizer.check, checkValidId, getTask, function (req, res) {
    res.status(200).json({ task: req.task });
});

app.delete('/removeTask/:id', tokenizer.check, checkValidId, getTask, async function (req, res) {
    await Task.deleteOne({_id: req.task._id});
    res.status(200).json({ message: 'Removed successfully.', task: req.task });
});

app.put('/modifyTask/:id', tokenizer.check, checkValidId, getTask, async function (req, res) {
    await Task.updateOne({_id: req.task._id}, req.body);
    const newTask = await Task.findById(req.task._id);
    res.status(200).json({ message: 'Edited successfully.', oldtask: req.task, newtask: newTask });
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
});

app.delete('/removeAllUsers', async function (req, res) {
    await User.remove({});

});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});