'use strict';
var models = require('../models')
var mensaje = models.mensaje;
var destinatario = models.destinatario;
var usuario = models.usuario;
var archivo = models.archivo;
class MensajeControl {

    async guardar(req, res) {
        if (req.body.hasOwnProperty('asunto') &&
            req.body.hasOwnProperty('contenido') &&
            req.body.hasOwnProperty('tipo') &&
            req.body.hasOwnProperty('fecha') &&
            req.body.hasOwnProperty('id_destinatario') &&
            req.body.hasOwnProperty('id_usuario')) {
                var uuid = require('uuid');
                var destinatarioA = await destinatario.findOne({
                    where: { external_id: req.body.id_destinatario },
                });
                var usuarioA = await usuario.findOne({
                    where: { external_id: req.body.id_usuario },
                });
                if (destinatarioA == undefined || destinatarioA == null || usuarioA == undefined || usuarioA == null) {
                    res.status(401);
                    res.json({ msg: "ERROR", tag: "No se encuentra el destinatario", code: 401 });
                } else {
                    //if (motaA.rol == 'ESCLAVO') {
                var data = {
                    asunto: req.body.asunto,
                    contenido: req.body.contenido,
                    external_id: uuid.v4(),
                    tipo: req.body.tipo,
                    fecha: req.body.fecha,
                    id_destinatario: destinatarioA.id,
                    id_usuario: usuarioA.id
                }
                    var result = await mensaje.create(data);
                    if (result === null) {
                        res.status(401);
                        res.json({ msg: "ERROR", tag: "NO se puede crear", code: 401 });
                    } else {
                        res.status(200);
                        res.json({ msg: "OK", code: 200 });
                    }
                //} else {
                    //res.status(400);
                    //res.json({ msg: "ERROR", tag: "La mota que guarda el sensor no es mota hijo", code: 400 });
                //}
            }                
        } else {
            res.status(400);
            res.json({ msg: "ERROR", tag: "Faltan datos", code: 400 });
        }
    }

    async guardar_archivo(req, res) {
        if (req.body.hasOwnProperty('nombre') &&
            req.body.hasOwnProperty('tipo') &&
            req.body.hasOwnProperty('dir') &&
            req.body.hasOwnProperty('id_mensaje')) {
                var uuid = require('uuid');
                var mensajeA = await mensaje.findOne({
                    where: { external_id: req.body.id_mensaje },
                });
                if (mensajeA == undefined || mensajeA == null) {
                    res.status(401);
                    res.json({ msg: "ERROR", tag: "No se encuentra la mota esclava", code: 401 });
                } else {
                    //if (motaA.rol == 'ESCLAVO') {
                var data = {
                    nombre: req.body.nombre,
                    tipo: req.body.tipo,
                    external_id: uuid.v4(),
                    dir: req.body.dir,
                    id_mensaje: mensajeA.id
                }
                    var result = await archivo.create(data);
                    if (result === null) {
                        res.status(401);
                        res.json({ msg: "ERROR", tag: "NO se puede crear", code: 401 });
                    } else {
                        res.status(200);
                        res.json({ msg: "OK", code: 200 });
                    }
                //} else {
                    //res.status(400);
                    //res.json({ msg: "ERROR", tag: "La mota que guarda el sensor no es mota hijo", code: 400 });
                //}
            }                
        } else {
            res.status(400);
            res.json({ msg: "ERROR", tag: "Faltan datos", code: 400 });
        }
    }

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
                }
                    var result = await lista.update(data);                                        
                    if (result === null) {
                        res.status(401);
                        res.json({ msg: "ERROR", tag: "NO se puede crear", code: 401 });
                    } else {
                        res.status(200);
                        res.json({ msg: "OK", code: 200 });
                    }
            } else {
                res.status(405);
                res.json({ msg: "ERROR_Ronald", tag: "El dato a buscar no existe", code: 405 });
            }
        } else {
            res.status(401);
            res.json({ msg: "ERROR_Ronald", tag: "Faltan datos", code: 401 });
        }
    }

}
module.exports = MensajeControl;