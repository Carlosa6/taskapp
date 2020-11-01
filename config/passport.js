const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;

//Referenia al usuario donde se va a autenticar
const Usuarios = require('../models/Usuarios');

//local strategy - login con credenciales propios
passport.use(
    new LocalStrategy(
        //por default passport espera un usuario y password
        {
            usernameField: 'email',
            passwordField: 'password'
        },
        async (email,password,done) => {
            try {
                const usuario = await Usuarios.findOne({
                    where: { 
                        email,
                        activo:1
                    }
                });

                //usuario existe pero contraseña incorrecta
                if(!usuario.verificarPassword(password)){
                    return done(null,false, {
                        message: 'La contraseña es incorrecta'
                    })
                }

                //email y password correcto
                return done(null,usuario);

            } catch (error) {
                //El usuario no existe
                return done(null,false, {
                    message: 'Esa cuenta no existe'
                })
            }
        }
    )
);

//serializar el usuario
passport.serializeUser((usuario,callback) => {
    callback(null,usuario);
});

//deserialziar el usuario
passport.deserializeUser((usuario,callback) => {
    callback(null,usuario);
});

module.exports = passport;