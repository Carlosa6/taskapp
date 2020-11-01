const express = require('express');
const router = express.Router();

//importar express validator
const { body } = require('express-validator');

//importar el controlador
const proyectosController = require('../controllers/proyectosController');
const tareasController = require('../controllers/tareasController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');

module.exports = function(){
    //ruta del home
    router.get('/',
        authController.usuarioAutenticado,
        proyectosController.proyectosHome
    );

    //formulario crear proyecto
    router.get('/nuevo-proyecto',
        authController.usuarioAutenticado,
        proyectosController.formularioProyecto);

    //validar los datos
    router.post('/nuevo-proyecto',
            authController.usuarioAutenticado,
            body('nombre')
            .not().isEmpty()
            .trim()
            .escape(),
            proyectosController.nuevoProyecto);
    
    //Listar por proyecto
    router.get('/proyectos/:url',
        authController.usuarioAutenticado,
        proyectosController.proyectoPorUrl);

    //Actualizar el proyecto: obtener el nombre
    router.get('/proyecto/editar/:id',
        authController.usuarioAutenticado,
        proyectosController.formularioEditar);
    //actualizar el nombre y url
    router.post('/nuevo-proyecto/:id',
    authController.usuarioAutenticado,
    body('nombre')
    .not().isEmpty()
    .trim()
    .escape(),
    proyectosController.actualizarProyecto);

    //Eliminar proyecto
    router.delete('/proyectos/:url',
        authController.usuarioAutenticado,
        proyectosController.eliminarProyecto);

    ///////////////////////////// TAREAS ////////////////////////////////////////////////

    //Agregar tarea
    router.post('/proyectos/:url',
        authController.usuarioAutenticado,
        tareasController.agregarTarea
    );

    //Actualiza tarea : completada o no
    //Se utiliza patch porque solo se va a modificar una parte de los datos
    //El update se utiliza para cambiar todo los datos
    router.patch('/tareas/:id',
        authController.usuarioAutenticado,
        tareasController.cambiarEstadoTarea)

    //Eliminar tarea
    router.delete('/tareas/:id',
        authController.usuarioAutenticado,
        tareasController.eliminarTarea
    )

    /////////////////////////////////// USUARIOS ////////////////////////////////////////

    //crear nueva cuenta
    router.get('/crear-cuenta', usuariosController.formCrearCuenta)
    router.post('/crear-cuenta', usuariosController.crearCuenta)
    router.get('/confirmar/:correo', usuariosController.confirmarCuenta);

    //iniciar sesión
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);
    router.post('/iniciar-sesion', authController.autenticarUsuario);

    //cerrar sesión
    router.get('/cerrar-sesion', authController.cerrarSesion);

    //reestablecer contraseña
    router.get('/reestablecer', usuariosController.formRestablecerPassword);
    router.post('/reestablecer', authController.enviarToken);
    router.get('/reestablecer/:token', authController.validarToken);
    router.post('/reestablecer/:token', authController.actualizarPassword);

    return router;
}