// ============================
//  Puerto
// ============================
process.env.PORT = process.env.PORT || 3000;

/*
ENTORNO
*/
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

/*
CADUCIDAD TOKEN
---------------
60 segundos
60 minutos
24 horas
365 días
*/
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 365;

/*
SEED
*/
process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';

/*
Base de datos
*/
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe'; //Conexión local
} else {
    urlDB = process.env.MONGO_URI; /*Se utilizó una variable de entorno para MONGO*/
}
process.env.URLDB = urlDB; //Variable para la conexión a la base de datos