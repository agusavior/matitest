var express = require('express');
var app = express();

var mongoose = require('mongoose');
mongoose.connect(
    'mongodb+srv://mati-test-user0:aWCS8CGePfYkF0dgaFod@matitestcluster-nfoij.mongodb.net/test?retryWrites=true&w=majority',
    { useNewUrlParser: true, useUnifiedTopology: true }
).catch(error => console.log(error));

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Conectado a MongoDB!');
});

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.get('/login', function (req, res) {
    res.send('user: ' + req.query.user + '\npass: ' + req.query.pass);
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});