'use strict';
var models = require('../models');
var mensaje = models.mensaje;
var destinatario = models.destinatario;
var usuario = models.usuario;
var archivo = models.archivo;
var uuid = require('uuid');
var path = require('path');
var fs = require('fs');
var multer = require('multer'); // Importamos multer

// Configuración de almacenamiento con Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../uploads'); // Carpeta donde se guardan los archivos
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueName = uuid.v4() + path.extname(file.originalname); // Genera un nombre único
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: storage });

class MensajeControl {

    // Función para guardar un mensaje
    async guardar(req, res) {
        if (req.body.hasOwnProperty('asunto') &&
            req.body.hasOwnProperty('contenido') &&
            req.body.hasOwnProperty('tipo') &&
            req.body.hasOwnProperty('fecha') &&
            req.body.hasOwnProperty('id_destinatario') &&
            req.body.hasOwnProperty('id_usuario')) {
            
            var destinatarioA = await destinatario.findOne({
                where: { external_id: req.body.id_destinatario },
            });
            var usuarioA = await usuario.findOne({
                where: { external_id: req.body.id_usuario },
            });

            if (!destinatarioA || !usuarioA) {
                res.status(401).json({ msg: "ERROR", tag: "No se encuentra el destinatario o el usuario", code: 401 });
            } else {
                var data = {
                    asunto: req.body.asunto,
                    contenido: req.body.contenido,
                    external_id: uuid.v4(),
                    tipo: req.body.tipo,
                    fecha: req.body.fecha,
                    id_destinatario: destinatarioA.id,
                    id_usuario: usuarioA.id
                };

                var result = await mensaje.create(data);
                if (!result) {
                    res.status(401).json({ msg: "ERROR", tag: "No se puede crear el mensaje", code: 401 });
                } else {
                    res.status(200).json({ msg: "OK", code: 200, info: data.external_id });
                }
            }
        } else {
            res.status(400).json({ msg: "ERROR", tag: "Faltan datos", code: 400 });
        }
    }

    async guardar_archivo(req, res) {
        upload.single('archivo')(req, res, async function (err) {
            if (err) {
                return res.status(500).json({ msg: "ERROR", tag: "Error al subir el archivo", code: 500 });
            }

            if (!req.body.nombre || !req.body.tipo || !req.body.id_mensaje || !req.file) {
                return res.status(400).json({ msg: "ERROR", tag: "Faltan datos o archivo", code: 400 });
            }

            try {
                // Buscar el mensaje con el id recibido
                const mensajeA = await mensaje.findOne({
                    where: { external_id: req.body.id_mensaje },
                });

                if (!mensajeA) {
                    return res.status(401).json({ msg: "ERROR", tag: "No se encuentra el mensaje", code: 401 });
                }

                // Guardamos la referencia del archivo en la base de datos
                const data = {
                    nombre: req.body.nombre,
                    tipo: req.body.tipo,
                    external_id: uuid.v4(),
                    dir: req.file.path, // Guardamos la ruta real del archivo subido
                    id_mensaje: mensajeA.id
                };

                const result = await archivo.create(data);
                if (!result) {
                    return res.status(401).json({ msg: "ERROR", tag: "No se puede guardar el archivo", code: 401 });
                }

                res.status(200).json({ msg: "OK", code: 200, filePath: data.dir });
            } catch (error) {
                console.error(error);
                res.status(500).json({ msg: "ERROR", tag: "Error interno del servidor", code: 500 });
            }
        });
    }

    // Función para modificar destinatario
    async modificar(req, res) {
        const external = req.params.external;

        if (req.body.hasOwnProperty('nombres') &&
            req.body.hasOwnProperty('apellidos') &&
            req.body.hasOwnProperty('correo') &&
            req.body.hasOwnProperty('id_grupo')) {

            const lista = await destinatario.findOne({
                where: { external_id: external },
            });

            var grupoA = await grupo.findOne({ where: { external_id: req.body.id_grupo } });
            if (grupoA != undefined) {
                var data = {
                    nombres: req.body.nombres,
                    external_id: lista.external_id,
                    apellidos: req.body.apellidos,
                    correo: req.body.correo,
                    id_grupo: grupoA.id,
                };
                var result = await lista.update(data);
                if (result === null) {
                    res.status(401).json({ msg: "ERROR", tag: "No se puede modificar el destinatario", code: 401 });
                } else {
                    res.status(200).json({ msg: "OK", code: 200 });
                }
            } else {
                res.status(405).json({ msg: "ERROR", tag: "El grupo no existe", code: 405 });
            }
        } else {
            res.status(401).json({ msg: "ERROR", tag: "Faltan datos", code: 401 });
        }
    }

}

module.exports = MensajeControl;
