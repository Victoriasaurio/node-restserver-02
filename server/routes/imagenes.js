const express = require('express');
const fs = require('fs');
const path = require('path');

const { verificaTokenImg } = require('../middlewares/authentication');

const app = express();

app.get('/imagen/:tipo/:img', verificaTokenImg, (req, res) => {
    let tipo = req.params.tipo;
    let img = req.params.img;

    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${img}`); //Posiciona en la carpeta a modificar.

    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen)
    } else {
        let noImagePath = path.resolve(__dirname, '../assets/noimagefound.jpg'); //Ruta absoluta de la imagen.
        res.sendFile(noImagePath); //Envia la imagen de NotFound
    }

});



module.exports = app;