const express = require('express');

const Producto = require('../models/producto');
const { VerificaToken } = require('../middlewares/authentication');

const app = express();

app.get('/productos', VerificaToken, (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde); /* allowed send parameters; convert DESDE number */

    let limite = req.query.limite || 3;
    limite = Number(limite);

    Producto.find({ disponible: true }) //Productos disponible
        .skip(desde)
        .limit(limite)
        .sort('nombre') //Ordena orden alfabético por medio de 'descripción'
        .populate('usuario', 'nombre email') //'usuario': nombre del esquema; Campos específicos a imprimir
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            });
        })
});

app.get('/productos/:id', VerificaToken, (req, res) => {
    id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'nombre email') //'usuario': nombre del esquema; Campos específicos a imprimir
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productoDB) {
                return res.status(500).json({
                    ok: false,
                    err: {
                        message: 'El producto no existe'
                    }
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });
        });
});

/*
Buscar productos
*/

//Busqueda de productos tecleando términos del mismo, no necesariamente exactos
app.get('/productos/buscar/:termino', VerificaToken, (req, res) => {
    let termino = req.params.termino;
    let regex = RegExp(termino, 'i'); //'i' toma mayusculas y minusculas

    Producto.find({ nombre: regex })
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            });
        });
});

app.post('/productos', VerificaToken, (req, res) => {
    let body = req.body;

    let productos = new Producto({
        usuario: req.usuario._id,
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria
    });

    productos.save((err, productosBD) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.status(201).json({
            ok: true,
            productos: productosBD,
            message: 'Producto añadido a la base de datos'
        });
    });
});

app.put('/productos/:id', VerificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    let descProductos = {
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        disponible: body.disponible
    };

    Producto.findByIdAndUpdate(id, descProductos, { new: true, runValidators: true }, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB,
            message: 'Categoria actualizado'
        });
    });
});

app.delete('/productos/:id', VerificaToken, (req, res) => {
    id = req.params.id;

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'ID no existe'
                }
            });
        }

        productoDB.disponible = false;

        productoDB.save((err, productoBorrado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoBorrado,
                mensaje: 'Producto borrado'
            });
        });
    });
});

module.exports = app;