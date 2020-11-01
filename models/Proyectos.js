const Sequelize = require('sequelize');
const db = require('../config/db');
const slug = require('slug');
const shortid = require('shortid');

const Proyectos = db.define('proyectos',{ //nombre del modelo
    id:{
        type: Sequelize.INTEGER,
        primaryKey:true,
        autoIncrement: true
    },
    nombre:{
        type:Sequelize.STRING(100)
    },
    url:{
        type: Sequelize.STRING(100)
    }
}, {
    hooks: {
        beforeCreate(proyecto){ //objeto que se va a insertar
            const url = slug(proyecto.nombre).toLowerCase();
            //añadir la url
            proyecto.url = `${url}-${shortid.generate()}`;
        }
    }
});

module.exports = Proyectos;
