require('./config/config');

const express = require('express');
const mongoose = require('mongoose');
const app = express();

const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(require('./routes/usuario'));

//Configuración de la base de datos-Mongo
mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }, //Resuelve warning de consola al ejecutar el proyecto
    (err, res) => {
        if (err) throw err;

        console.log('Base de datos ONLINE');
    });

app.listen(process.env.PORT, () => {
    console.log('Escuchando puerto:', process.env.PORT, 'de Tony Stark');
});