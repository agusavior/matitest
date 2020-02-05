var express = require('express');
var mongoose = require('mongoose');
var app = express();
var bodyParser = require('body-parser');
var tokenizer = require('./tokenizer');

// Esta linea es para solucionar un DeprecationWarning
mongoose.set('useCreateIndex', true); 

const User = require('./models/user');
const Task = require('./models/task');

// Esto sirve para poder usar jsons como Content-Type
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// La contraseña para acceder al cluster de mongo en https://www.mongodb.com/cloud/atlas
const MONGO_ATLAS_PASSWORD = 'aWCS8CGePfYkF0dgaFod';

// Hacemos la conexión con el cluster
mongoose.connect(
    'mongodb+srv://mati-test-user0:' + MONGO_ATLAS_PASSWORD + '@matitestcluster-nfoij.mongodb.net/test?retryWrites=true&w=majority',
    { useNewUrlParser: true, useUnifiedTopology: true }
).catch(error => console.log(error));

// Detectamos posibles inconvenientes.
// Este codigo fue extraido de https://mongoosejs.com/docs/index.html
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Conectado a MongoDB!');
});

// Este es un middleware para verificar si se ha proporcionado un body en la petición.
// En caso de que de el body exista, sigue con la ejecución.
// He tenido problemas con esto al principio, pero ahora ya no me sucede más que el body venga vacío.
// Por las dudas voy a mantener esta función existiendo. Siéntase libre de borrarla.
const checkIfBodyExists = (req, res, next) => {
    if(req.body == undefined) {
        return res.status(400).json({ message: 'Undefined body. Remember set \'Content-Type\' as \'application/json\' in Headers.' });
    }
    next();
}

app.post('/register', checkIfBodyExists, async function (req, res) {
    // Generamos un usuario directamente con el body.
    const user = new User(req.body);

    try {
        // Este save() falla en caso de que no se haya suministrado un dato
        // obligatorio o en caso de que haya habido una colisión de usernames.
        // Esto está especificado en user.js
        await user.save();

        res.status(200).json({ message: 'User registered successfully.' });
    } catch(err) {
        res.status(400).json({ message: err.message });
    }
});

app.get('/login', checkIfBodyExists, async function (req, res) {
    // Obtiene el username del body y busca el único User con dicho username
    const user = await User.findOne({user: req.body.user});

    // Si no ha encontrado nada, entonces termina la ejecución.
    if(user == undefined) {
        return res.status(409).json({ message: 'No user finded.' });
    }

    // Comprueba si el password otorgado es correcto.
    if(user.pass != req.body.pass) {
        return res.status(401).json({ message: 'Wrong pass.' });
    }

    // Generamos el token, solo con el ID del usuario.
    // Realmente no es relevante qué cosa se firma. En este caso decidí guardar
    // el user._id pero pude haber guardado cualquier cosa.
    // Lo importante es que el token cumpla con la caracteristica de poder ser 
    // decodificado usando la private_key del servidor.
    const token =  tokenizer.sign({
        userId: user._id,
    });

    // Retorna el token y el nombre del usuario.
    return res.status(201).json({ message: 'Login successful.', token, name: user.name });
});

app.get('/getAllTasks', tokenizer.check, function (req, res) {
    Task.find().exec().then(tasks => {
        // Este codigo NO es ejecutado una vez por cada task.
        // Este codigo se ejecuta una sola vez al finalizar la busqueda
        // de todos los tasks.
        // La variable 'tasks' es una lista con todos los tasks.
        // Retornamos la lista directamente:
        res.status(200).json(tasks);
    });
});

app.post('/createTask', checkIfBodyExists, tokenizer.check, async function (req, res) {
    // Creamos un nuevo Task desde el body
    const task = new Task(req.body);

    try {
        // Este save podría fallar en caso de que el body no cumpla
        // los requerimientos especificados en task.js
        await task.save();
        
        res.status(200).json({ message: 'Created successfully.', task: task });
    } catch(err) {
        res.status(400).json({ message: 'Invalid format for Task.' });
    }
});

// Este es un middleware para verificar que la ID del Task tiene el formato correcto para
// ser admitido por mongoose. Si no tiene el formato correcto, la ejecución se detiene.
const checkValidId = (req, res, next) => {
    if(!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: 'Bad id format.' });
    }
    next();
}

// Este es un middleware que obtiene el task y lo guarda en req.task para
// ser usado posteriormente. En caso de que no exista el task, o haya sido borrado, la ejecución se detiene.
const getTask = async (req, res, next) => {
    const task = await Task.findById(req.params.id);

    // Si no existe el task con dicha ID, avisa.
    if(!task) {
        return res.status(400).json({ message: 'There are not tasks with that id.' });
    }

    // En caso de que exista, lo guardamos en req.task para usos futuros.
    req.task = task;

    next();
}

app.get('/getTask/:id', tokenizer.check, checkValidId, getTask, function (req, res) {
    res.status(200).json(req.task);
});

app.delete('/removeTask/:id', tokenizer.check, checkValidId, getTask, async function (req, res) {
    await Task.deleteOne({_id: req.task._id});

    // Retornamos el task recientemente borrado.
    res.status(200).json({ message: 'Removed successfully.', task: req.task });
});

app.put('/modifyTask/:id', checkIfBodyExists, tokenizer.check, checkValidId, getTask, async function (req, res) {
    await Task.updateOne({_id: req.task._id}, req.body);

    // Hace de nuevo otra consulta para obtener el elemento recién creado.
    const newTask = await Task.findById(req.task._id);

    // Retornamos el task anterior y el task actualizado con los nuevos parámetos.
    res.status(200).json({ message: 'Edited successfully.', oldtask: req.task, newtask: newTask });
});

// Por las dudas, una página de inicio:
app.get('/', function (req, res) {
    res.status(200).json({ message: 'Server is running.' });
})

// Iniciamos el servidor...
app.listen(3000, function () {
    console.log('MatiTest is listening on port 3000!');
});