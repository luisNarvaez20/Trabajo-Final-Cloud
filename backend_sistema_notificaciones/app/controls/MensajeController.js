'use strict';
var models = require('../models');
var mensaje = models.mensaje;
var destinatario = models.destinatario;
var usuario = models.usuario;
var archivo = models.archivo;
var grupo = models.grupo;
var uuid = require('uuid');
var path = require('path');
var fs = require('fs');
var multer = require('multer'); // Importamos multer
var crypto = require('crypto');
const { Sequelize } = require('sequelize');

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

    
    async listarMensaje(req, res) {
        try {
            var lista = await mensaje.findAll({
                include: [
                    {
                        model: models.archivo, 
                        as: "archivo", 
                        attributes: ['tipo', 'dir'],
                        required: false // Permite mensajes sin archivo
                    },
                ],
                attributes: ['asunto', 'contenido', 'external_id', 'tipo', 'fecha', 'resumen', 'remitente']
            });
    
            console.log(lista);
            res.status(200).json({ msg: "OK", code: 200, datos: lista });
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: "Error en la consulta", code: 500, error: error.message });
        }
    }
    

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

    //METODO PARA OBTENER DATOS DE MENSAJES
    async obtener(req, res) {
        try {

            // Buscar el grupo usando el external_id de los parámetros de la URL
            const g = await grupo.findOne({
                where: { external_id: req.params.external }
            });

            if (!g) {
                return res.status(404).json({ msg: 'Grupo no encontrado', code: 404 });
            }

            // Buscar los mensajes asociados al grupo encontrado
            const listar = await mensaje.findAll({
                attributes: ['asunto', 'contenido', 'fecha', 'tipo', 'external_id'],
                where: { id_grupo: g.id }
            });


            res.json({ msg: 'OK!', code: 200, info: listar || [] });
        } catch (error) {
            console.error('Error al obtener los mensajes:', error);
            res.status(500).json({ msg: 'Error al obtener los mensajes', code: 500 });
        }
    }

    //METODO PARA OBTENER DATOS DE MENSAJES
    async obtenerValor(req, res) {
        try {

            var listar = await mensaje.findAll({
                include: [
                    {
                        model: models.archivo, 
                        as: "archivo", 
                        attributes: ['tipo', 'dir'],
                        required: false // Permite mensajes sin archivo
                    },
                ],
                where:{tipo : req.params.valor},
                attributes: ['asunto', 'contenido', 'external_id', 'tipo', 'fecha', 'resumen', 'remitente']
            });

            if (!listar) {
                return res.status(404).json({ msg: 'No hay mensajes aun', code: 404 });
            }

            res.json({ msg: 'OK!', code: 200, datos: listar || [] });
        } catch (error) {
            console.error('Error al obtener los mensajes:', error);
            res.status(500).json({ msg: 'Error al obtener los mensajes', code: 500 });
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

    async enviarMensajeLogicApps(req, res) {
        try {
            // Validar datos requeridos
            if (!req.body.asunto || !req.body.contenido || !req.body.grupo || !req.body.archivos) {
                return res.status(400).json({
                    msg: "ERROR",
                    tag: "Faltan campos requeridos",
                    code: 400
                });
            }
            console.log("1. validado");
            // Buscar grupo
            var grupoId = await grupo.findOne({ where: { external_id: req.body.grupo } });
            if (!grupoId) {
                return res.status(404).json({
                    msg: "ERROR",
                    tag: "Grupo no encontrado",
                    code: 404
                });
            }

            var user = await usuario.findOne({ where: { external_id: req.body.external } });
            if (!grupoId) {
                return res.status(404).json({
                    msg: "ERROR",
                    tag: "Usuario no encontrado",
                    code: 404
                });
            }
            console.log("2. grupo encontrado");

            //guardar datos en mensaje
            var data = {
                asunto: req.body.asunto,
                contenido: req.body.contenido,
                tipo: 'correo',
                fecha: new Date(),
                id_usuario: user.id,
                id_grupo: grupoId.id,
            };
            console.log("3. data guardada");

            var messageResult = await mensaje.create(data);
            if (!messageResult) {
                return res.status(401).json({ msg: "ERROR", tag: "No se puede crear el mensaje", code: 401 });
            }
            // Obtener URL de Logic Apps desencriptandola por base64
            const encryptedText = process.env.LOGIC_APPS_URL;
            const decrypted = Buffer.from(encryptedText, "base64").toString("utf8");
            let logicAppsUrl = decrypted;
            if (!logicAppsUrl) {
                return res.status(500).json({
                    msg: "ERROR",
                    tag: "URL de Logic Apps no configurada",
                    code: 500
                });
            }
            console.log("4. url logic apps obtenida: " + process.env.LOGIC_APPS_URL);
            console.log("4.1. url decodificada: " + logicAppsUrl);
            //obtener los correos de los destinatarios del grupo
            var destinatarios = await destinatario.findAll({ where: { id_grupo: grupoId.id } });
            if (!destinatarios || destinatarios.length === 0) {
                return res.status(401).json({
                    msg: "ERROR",
                    tag: "No se encuentran destinatarios en el grupo",
                    code: 401
                });
            }
            console.log("5. destinatarios obtenidos");
            console.log(destinatarios.map(destinatario => destinatario.correo));
            const correosDestinatarios = destinatarios
                .map(dest => dest.correo)
                .filter(correo => correo); // Filtrar nulls/undefined
            console.log("5.1 correos destinatarios obtenidos");
            if (correosDestinatarios.length === 0) {
                return res.status(401).json({
                    msg: "ERROR",
                    tag: "No hay correos válidos en el grupo",
                    code: 401
                });
            }
            // Estructurar payload
            const payload = {
                asunto: req.body.asunto,
                contenido: req.body.contenido,
                destinatario: correosDestinatarios,
                archivos: req.body.archivos || []
            };
            console.log("6.payload estructurado");
            console.log(JSON.stringify(payload));

            // Realizar petición a Logic Apps
            const response = await fetch(logicAppsUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            const responseText = await response.text();
            console.log("Respuesta raw:", responseText);
            let results;
            try {
                // Si la respuesta incluye "body", extraer solo esa parte
                if (responseText.includes('"body":')) {
                    const bodyMatch = responseText.match(/"body":\s*({.*})/);
                    if (bodyMatch && bodyMatch[1]) {
                        results = JSON.parse(bodyMatch[1]);
                    }
                } else {
                    results = JSON.parse(responseText);
                }
            } catch (error) {
                console.error("Error parseando JSON:", error);
                throw new Error("Error al procesar la respuesta de Logic Apps");
            }
            if (!response.ok) {
                throw new Error(`Error al enviar a Logic Apps: ${response.statusText}`);
            }
            console.log("8. respuesta obtenida de logic apps:", results);

            // Validar la estructura de la respuesta
            if (!results || !results.archivos) {
                throw new Error('Respuesta inválida de Logic Apps');
            }

            console.log("8. respuesta obtenida de logic apps");
            // Guardar archivos en base de datos
            const archivosGuardados = [];
            for (const file of results.archivos) {
                const nuevoArchivo = await archivo.create({
                    nombre: file.nombre,
                    dir: file.url,
                    tipo: file.tipo || 'application/octet-stream',
                    id_mensaje: messageResult.id
                });
                archivosGuardados.push(nuevoArchivo);
            }
            res.status(200).json({
                msg: "OK",
                tag: "Mensaje enviado correctamente",
                code: 200,
                data: results
            });
            console.log("9. archivos guardados en base de datos correctamente");

        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({
                msg: "ERROR",
                tag: "Error al enviar mensaje",
                code: 500,
                error: error.message
            });
        }
    }


    async enviarMensajeRechazar(req, res) {
        try {
            // Decodificación de la URL
            const encryptedText = process.env.LOGIC_APPS_URL;
            if (!encryptedText) {
                return res.status(500).json({
                    msg: "ERROR",
                    tag: "URL de Logic Apps no configurada",
                    code: 500
                });
            }
    
            const decrypted = Buffer.from(encryptedText, "base64").toString("utf8");
            if (!decrypted) {
                return res.status(500).json({
                    msg: "ERROR",
                    tag: "URL de Logic Apps no válida",
                    code: 500
                });
            }
    
            let logicAppsUrl = decrypted;
    
            // Estructurar payload
            const payload = {
                asunto: "RESPUESTA DE RECURSOS HUMANOS",
                contenido: "Se le agradece por su tiempo para enviar el correo, pero actualmente no ha sido considerado para este proceso",
                destinatario: [req.body.remitente],
                archivos: []
            };
    
            // Realizar petición a Logic Apps
            const response = await fetch(logicAppsUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
    
            if (!response.ok) {
                throw new Error(`Error al enviar a Logic Apps: ${response.statusText}`);
            }
    
            const responseText = await response.text();
    
            let results;
            try {
                // Si la respuesta incluye "body", extraer solo esa parte
                if (responseText.includes('"body":')) {
                    const bodyMatch = responseText.match(/"body":\s*({.*})/);
                    if (bodyMatch && bodyMatch[1]) {
                        results = JSON.parse(bodyMatch[1]);
                    }
                } else {
                    results = JSON.parse(responseText);
                }
            } catch (error) {
                console.error("Error parseando JSON:", error);
                throw new Error("Error al procesar la respuesta de Logic Apps");
            }
    
            // Validar la estructura de la respuesta
            if (!results || !results.archivos) {
                throw new Error('Respuesta inválida de Logic Apps');
            }
    
            console.log("Respuesta obtenida de Logic Apps:", results);
    
            // Respuesta exitosa
            res.status(200).json({
                msg: "Mensaje enviado exitosamente",
                code: 200,
                data: results
            });
    
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({
                msg: "ERROR",
                tag: "Error al enviar mensaje",
                code: 500,
                error: error.message
            });
        }
    }
    
    async enviarRespuesta(req, res) {
        try {
            // Decodificación de la URL
            const encryptedText = process.env.LOGIC_APPS_URL;
            if (!encryptedText) {
                return res.status(500).json({
                    msg: "ERROR",
                    tag: "URL de Logic Apps no configurada",
                    code: 500
                });
            }
    
            const decrypted = Buffer.from(encryptedText, "base64").toString("utf8");
            if (!decrypted) {
                return res.status(500).json({
                    msg: "ERROR",
                    tag: "URL de Logic Apps no válida",
                    code: 500
                });
            }
    
            let logicAppsUrl = decrypted;
    
            // Estructurar payload
            const payload = {
                asunto: req.body.asunto,
                contenido: req.body.contenido,
                destinatario: [req.body.remitente],
                archivos: []
            };

            console.log("paylod", payload)
    
            // Realizar petición a Logic Apps
            const response = await fetch(logicAppsUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
    
            if (!response.ok) {
                throw new Error(`Error al enviar a Logic Apps: ${response.statusText}`);
            }
    
            const responseText = await response.text();
    
            let results;
            try {
                // Si la respuesta incluye "body", extraer solo esa parte
                if (responseText.includes('"body":')) {
                    const bodyMatch = responseText.match(/"body":\s*({.*})/);
                    if (bodyMatch && bodyMatch[1]) {
                        results = JSON.parse(bodyMatch[1]);
                    }
                } else {
                    results = JSON.parse(responseText);
                }
            } catch (error) {
                console.error("Error parseando JSON:", error);
                throw new Error("Error al procesar la respuesta de Logic Apps");
            }
    
            // Validar la estructura de la respuesta
            if (!results || !results.archivos) {
                throw new Error('Respuesta inválida de Logic Apps');
            }
    
            console.log("Respuesta obtenida de Logic Apps:", results);
    
            // Respuesta exitosa
            res.status(200).json({
                msg: "Mensaje enviado exitosamente",
                code: 200,
                data: results
            });
    
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({
                msg: "ERROR",
                tag: "Error al enviar mensaje",
                code: 500,
                error: error.message
            });
        }
    }

    async recibirMensaje(req, res) {
        const transaction = await models.sequelize.transaction(); // Iniciar la transacción

        console.log("respuesta req: "+req.body);
        console.log("Cuerpo de la solicitud:", JSON.stringify(req.body, null, 2));

        try {
            const data = {
                asunto: req.body.asunto,
                contenido: req.body.contenido,
                tipo: req.body.tipo,
                fecha: req.body.fecha,
                resumen: req.body.resumen,
                remitente: req.body.remitente,
                external_id: req.body.external_id
            };

            // Crear y guardar mensaje dentro de la transacción
            const mensajeCreado = await mensaje.create(data, { transaction });

            for (const anexo of req.body.anexos || []) { // Evita error si `anexos` es undefined
                const data2 = {
                    nombre: anexo.nombre,
                    tipo: anexo.tipo,
                    dir: anexo.url,
                    external_id: req.body.external_id,
                    id_mensaje: mensajeCreado.id
                };

                await archivo.create(data2, { transaction });
                console.log("Archivo guardado con éxito");
            }

            await transaction.commit(); // Confirmar la transacción
            console.log("Mensaje guardado con éxito");
            return res.status(200).json({ msg: "MENSAJE RECIBIDO CON ÉXITO", code: 200 });

        } catch (error) {
            await transaction.rollback(); // Revertir cambios en caso de error

            console.error("Error al guardar el mensaje o archivos:", error);
            const errorMsg = error.errors?.[0]?.message || error.message;
            return res.status(500).json({ msg: errorMsg, code: 500 });

        }
    }
}

module.exports = MensajeControl;

