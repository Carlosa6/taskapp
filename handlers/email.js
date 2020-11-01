const nodemailer = require('nodemailer');
const pug = require('pug');
const juice = require('juice');
const htmlToText = require('html-to-text');
const util = require('util');
const emailConfig = require('../config/email');

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    auth: {
        user: emailConfig.user, // generated ethereal user
        pass: emailConfig.pass // generated ethereal password
    }
});

const generarHTML = (archivo,opciones={}) => {
    //importar el html
    const html = pug.renderFile(`${__dirname}/../views/emails/${archivo}.pug`,opciones);
    return juice(html); //para que agregue todos los estilos
}

exports.enviar = async (opciones) => {
    const html = generarHTML(opciones.archivo,opciones);
    const text = htmlToText.fromString(html);
    let opcionesEmail = {
        from: '"UpTask" <no-reply@uptask.com>', // sender address
        to: opciones.usuario.email,
        subject: opciones.subject, // Subject line
        text,
        html
    };

    const enviarEmail = util.promisify(transporter.sendMail,transporter);
    return enviarEmail.call(transporter,opcionesEmail);

}
