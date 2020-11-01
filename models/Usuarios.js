const Sequelize = require('sequelize');
const db = require('../config/db');
const Proyectos = require('./Proyectos');
const bcrypt = require('bcrypt');

const Usuarios = db.define('usuarios', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fullname: {
        type: Sequelize.STRING(100)
    },
    email: {
        type: Sequelize.STRING(60),
        allowNull:false,
        validate:{
            isEmail:{
                msg: 'Agrega un correo válido'
            },
            notEmpty:{
                msg:'El correo no pued ir vacío'
            }
        },
        unique:{
            args:true,
            msg:'Usuario ya registrado con ese correo'
        }
    },
    password: {
        type: Sequelize.STRING(60),
        allowNull:false,
        validate:{
            notEmpty:{
                msg:'La contraseña no puede ir vacía'
            }
        }
    },
    activo: {
        type: Sequelize.INTEGER(1),
        defaultValue:0
    },
    token: Sequelize.STRING,
    expiracion: Sequelize.DATE
}, {
    hooks: {
        beforeCreate(usuario){
            usuario.password = bcrypt.hashSync(usuario.password, bcrypt.genSaltSync(10));
        }
    }
});

//Métodos personalizados
Usuarios.prototype.verificarPassword = function(password){
    return bcrypt.compareSync(password,this.password);
}

Usuarios.hasMany(Proyectos);

module.exports = Usuarios;