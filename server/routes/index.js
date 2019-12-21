//Contiene las rutas para el navegador

const express = require('express');
const app = express();

app.use(require('./usuario'));
app.use(require('./login'));

module.exports = app;