const express = require('express');
const fileUpload = require('express-fileupload');

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');
const path = require('path');

const app = express();

app.use(fileUpload());

app.put('/upload/:tipo/:id', (req, res) => {
    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'No se ha seleccionado ningún archivo'
                }
            })
    }

    //Valida tipo 'usuario' o 'producto'
    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos permitidas son ' + tiposValidos.join(',') //Separa arreglo con comas.
            }
        });
    }

    let archivo = req.files.archivo;
    let archivoCortado = archivo.name.split('.'); //Nombre del archivo cortado, separado por punto
    let extension = archivoCortado[archivoCortado.length - 1]; //Devuelve el último valor Ej. png

    //Extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extension) < 0) { //'indexOf' busca en el arreglo variables iguales.
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son ' + extensionesValidas.join(','), //Separa arreglo con comas.
                ext: extension
            }
        });
    }

    //Cambiar nombre al archivo
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => { //Sube las imágenes con su propio nombre.
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //Aquí, imagen cargada | Verifica el tipo de imagen
        if (tipo === 'usuarios') {
            imagenUsuario(id, res, nombreArchivo);
        } else {
            imagenProductos(id, res, nombreArchivo);
        }

    });
});

function imagenUsuario(id, res, nombreArchivo) {
    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            borrarArchivo(nombreArchivo, 'usuarios');

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            borrarArchivo(nombreArchivo, 'usuarios');

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            });
        }

        borrarArchivo(usuarioDB.img, 'usuarios');

        //Guardando imagen en la base de datos
        usuarioDB.img = nombreArchivo;
        usuarioDB.save((err, usuarioGuardado) => {
            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            });
        });
    });
}

function imagenProductos(id, res, nombreArchivo) {
    Producto.findById(id, (err, productoDB) => {
        if (err) {
            borrarArchivo(nombreArchivo, 'productos');

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            borrarArchivo(nombreArchivo, 'productos');

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            });
        }

        borrarArchivo(productoDB.img, 'productos');

        //Guardando imagen en la base de datos
        productoDB.img = nombreArchivo;
        productoDB.save((err, productoGuardado) => {
            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            });
        });
    });
}

function borrarArchivo(nombreImagen, tipo) {
    //última versión de la imgen, evita doplicar las imágenes proporcionadas por el usuario
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`); //Posiciona en la carpeta a modificar.
    if (fs.existsSync(pathImagen)) { //Comprueba si existe la imagen
        fs.unlinkSync(pathImagen); //Actualiza la imagen sí existe.
    }
}

module.exports = app;