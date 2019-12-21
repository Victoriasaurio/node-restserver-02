const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');

const Usuario = require('../models/usuario');
const { VerificaToken, verificaAdmin_Role } = require('../middlewares/authentication');

const app = express();

app.get('/usuario', VerificaToken, (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde); /* allowed send parameters; convert DESDE number */

    let limite = req.query.limite || 5;
    limite = Number(limite);

    /* Example: ?limite10&desde=10 */

    /* Unicamente imprime en pantalla los usuarios existentes: {estado: true} */
    /* Se pueden seleccionar campos a imprimir: 'nombre email'*/
    Usuario.find({ estado: true }, 'nombre email') /* La condición debe ser igual en caso de que hubiera en el 'count' */
        .skip(desde)
        .limit(limite) /* allowed users on screen */
        .exec((err, usuario) => { /* execute find err or show objects array*/
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            /* Cuenta el total de datos */
            Usuario.count({ estado: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    usuario,
                    cuantos: conteo
                });
            });
        });
});

app.post('/usuario', [VerificaToken, verificaAdmin_Role], (req, res) => {

    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10), //Encripta las contraseñas
        role: body.role
    });

    usuario.save((err, usuarioBD) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioBD
        })
    });
});

app.put('/usuario/:id', [VerificaToken, verificaAdmin_Role], (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']); /* Unicamente permite actualizar estos objetos por medio de pick */

    /* Evita actualizar los campos es útil cuando son pocos objetos
    delete body.password;
    delete body.google;
    */

    /*
    {new: true} -- actualiza la información, cuanto este es actualizado en tiempo real.
    {runValidators: true -- no perimite la inserción de roles NO válidos}
    */

    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });

    });
});

app.delete('/usuario/:id', [VerificaToken, verificaAdmin_Role], (req, res) => {
    let id = req.params.id;

    let cambiaEstado = {
        estado: false
    };

    //  Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
    //  Borra los objetos de forma física.

    //findByIdAndUpdate -- cambia el estado de false a true
    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        };

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            })
        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});

module.exports = app;