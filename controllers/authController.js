const passport = require("passport");
const Usuarios = require('../models/Usuarios');
const Sequelize = require('sequelize');
const Op = Sequelize.Op
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const enviarEmail = require('../handlers/email');

//autenticar el usuario
exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/iniciar-sesion',
    failureFlash:true,
    badRequestMessage: 'Ambos campos son obligatorios'
});

//función para validar si el usuario está logueado o no
exports.usuarioAutenticado = (req,res,next) => {

    //si el usuario está autenticado, adelante
    if(req.isAuthenticated()) return next();

    //si no está autenticado, redireccionar al formulario
    return res.redirect('/iniciar-sesion');
}

//funcion para cerrar sesión
exports.cerrarSesion = (req,res) => {
    req.session.destroy(() => {
        res.redirect('/iniciar-sesion'); //redireccionar al login
    })
}

//genera un token si el usaurio es válido
exports.enviarToken = async (req,res) => {
    //verificar que el usuario existe
    const {email} = req.body;
    const usuario = await Usuarios.findOne({where : { email }});

    //Si no existe el usuario
    if(!usuario){
        req.flash('error', 'No existe esa cuenta');
        res.redirect('/reestablecer');
    }

    //usuario existe
    usuario.token = crypto.randomBytes(20).toString('hex'); //generar una cadena aleatoria
    usuario.expiracion = Date.now()+3600000;

    //guardar en la BD
    await usuario.save();

    //url de reset
    const resetUrl = `http://${req.headers.host}/reestablecer/${usuario.token}`;

    //envía el correo con el token
    await enviarEmail.enviar({
        usuario,
        subject:'Password Reset',
        resetUrl,
        archivo: 'reestablecer-password'
    })
    //archivo: es el nombre del archivo que contiene el html

    //terminar
    req.flash('correcto',`Se envió un mensaje a ${usuario.email}`)
    res.redirect('/iniciar-sesion');

}

exports.validarToken = async (req,res) => {
    //buscando al usuario que tiene el token que se pasó por parámetro
    const usuario = await Usuarios.findOne({
        where: {
            token: req.params.token
        }
    });

    //si no encontró el usuario
    if(!usuario){
        req.flash('error','No válido');
        res.redirect('/reestablecer');
    }

    //Formulario para generar la contraseña
    res.render('resetPassword', {
        nombrePagina: 'Reestablecer Contraseña'
    })

}

exports.actualizarPassword = async (req,res) => {

    //verifica el token válido y la fecha de expiración

    const usuario = await Usuarios.findOne({
        where: {
            token: req.params.token,
            expiracion: {
                [Op.gte]: Date.now()
            }
        }
    });

    //verificar si el usuario existe
    if(!usuario){
        req.flash('error', 'No válido');
        res.redirect('/reestablecer');
    }

    //hashear la nueva contraseña, eliminar eltoken y expiracion de la BD
    usuario.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
    usuario.token = null;
    usuario.expiracion = null;
    
    //guardar en la BD
    await usuario.save();

    //redireccionar a inicio de sesión
    req.flash('correcto', 'La contraseña se ha modificado correctamente');
    res.redirect('/iniciar-sesion');

}
