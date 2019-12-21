const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Usuario = require('../models/usuario');

const app = express();

app.post('/login', (req, res) => {
    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioBD) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(usuario) o contraseña inválidos'
                }
            });
        }

        //Compara la contraseña, !negando
        if (!bcrypt.compareSync(body.password, usuarioBD.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'usuario o (contraseña) incorrecto'
                }
            });
        }

        //Creación del token
        let token = jwt.sign({
            usuario: usuarioBD
        }, process.env.SEED, { expiresIn: 60 * 60 * 24 * 365 });

        res.json({
            ok: true,
            usuario: usuarioBD,
            token
        });
    });
});


module.exports = app;