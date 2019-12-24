const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//To validate an ID token in Node.js use the GOOGLE AUTH LIBRARY 
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

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

//Configuration of Google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload(); //Payload: contiene info del cliente

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

//Token por medio de una petición http.
app.post('/google', async(req, res) => {
    let token = req.body.idtoken;

    let googlerUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                err: e
            });
        });

    Usuario.findOne({ email: googlerUser.email }, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };

        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe usarse su autenticación normal'
                    }
                });
            } else {
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            }
        } else {
            //Si el usuario no existe en nuestra base de datos
            let usuario = new Usuario();

            usuario.nombre = googlerUser.nombre;
            usuario.email = googlerUser.email;
            usuario.img = googlerUser.img;
            usuario.google = true;
            usuario.password = '123';

            usuario.save((err, usuarioDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                };

                let token = jwt.sign({
                    usuario: usuarioDB,
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });

            });

        }
    });

    /* Impresión de los atributos de manera directa 
    res.json({
        usuario: googlerUser
    });
    */
});

//npm install google-auth-library --save {--Librería de google que valida los token--}

module.exports = app;