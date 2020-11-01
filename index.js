const express = require('express');
const routes = require('./routes');
const path = require('path');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('./config/passport');

//helpers con algunas funciones
const helpers = require('./helpers');

//Conexión a la BD
const db = require('./config/db');
// para que cree el modelo (la tabla) en la BD si es que no existe
//Importar el modelo
require('./models/Proyectos');
require('./models/Tareas');
require('./models/Usuarios');

db.sync()
.then(() => {
  console.log('Connection has been established successfully.');
})
.catch(err => {
  console.error('Unable to connect to the database:', err);
});

//crear una app de express
const app = express();

//Donde cargar los archivos estáticos
app.use(express.static('public'));

//Habilitar pug
app.set('view engine','pug');

//Añadir la carpeta de las vistas
app.set('views', path.join(__dirname,'views'));

//Agregar flash messages
app.use(flash());

app.use(cookieParser());

//sessiones permiten navegar entre distintas páginas sin volver a autenticar
app.use(session({
  secret: 'maisicret',
  resave:false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

//pasamos el var dump a la aplicación
app.use((req,res,next) => {
  res.locals.vardump = helpers.vardump;
  res.locals.mensajes = req.flash();
  res.locals.usuario = { ...req.user } || null;
  next();
})

//Habilitar body-parser para leer datos del formulario
app.use(bodyParser.urlencoded({extended:true}));

app.use('/', routes());

app.listen(3000, () => console.log('Server on port',3000));

require('./handlers/email');