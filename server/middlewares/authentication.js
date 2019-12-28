const jwt = require('jsonwebtoken');

/*
Verifica TOKEN
*/

let VerificaToken = (req, res, next) => {
    let token = req.get('token');

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }

        req.usuario = decoded.usuario; //decoded = payload
        next();
    });

}

/*
Verifica ADMIN_ROLE -- Solo el ADMINISTRADOR puede realizar las peticiones POST, PUT, DELETE, GET
Se debe renovar el token cuando haya cambios en el usuario
*/
let verificaAdmin_Role = (req, res, next) => {
    let usuario = req.usuario;
    if (usuario.role === 'ADMIN_ROLE') {
        next();
    } else {
        res.json({
            ok: false,
            err: {
                message: 'El usuario no es administrador'
            }
        });
    }
};

/*
Verifica TOKEN para IMAGEN
*/

let verificaTokenImg = (req, res, next) => {
    let token = req.query.token;

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }

        req.usuario = decoded.usuario; //decoded = payload
        next();
    });
}

module.exports = {
    VerificaToken,
    verificaAdmin_Role,
    verificaTokenImg
}