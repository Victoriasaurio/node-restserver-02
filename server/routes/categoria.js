const express = require('express');

const Categoria = require('../models/categoria');
const { VerificaToken, verificaAdmin_Role } = require('../middlewares/authentication');

const app = express();

app.get('/categoria', VerificaToken, (req, res) => {
    Categoria.find({})
        .sort('descripcion') //Ordena orden alfabético por medio de 'descripción'
        .populate('usuario', 'nombre email') //'usuario': nombre del esquema; Campos específicos a imprimir
        .exec((err, categorias) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                categorias
            });
        })
});

app.get('/categoria/:id', VerificaToken, (req, res) => {
    id = req.params.id;

    Categoria.findById(id, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'El ID no existe'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });

});

app.post('/categoria', VerificaToken, (req, res) => {
    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB,
            message: 'Categoria añadida a la base de datos'
        });
    });

});

app.put('/categoria/:id', VerificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    let descCategoria = {
        descripcion: body.descripcion
    };

    Categoria.findByIdAndUpdate(id, descCategoria, { new: true, runValidators: true }, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB,
            message: 'Categoria actualizada'
        });
    });
});

app.delete('/categoria/:id', [VerificaToken, verificaAdmin_Role], (req, res) => {
    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no existe'
                }
            });
        }

        res.json({
            ok: true,
            message: 'Categoria borrada'
        });
    });

});

module.exports = app;