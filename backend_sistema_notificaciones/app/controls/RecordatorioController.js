'use strict';
const { validationResult } = require('express-validator');

var models = require('../models/');
var recordatorio = models.recordatorio;
var grupo = models.grupo;
var usuario = models.usuario;
var mensaje = models.mensaje;

class RecordatorioController {


    // LISTAR GRUPOS POR USUARIO
    async listar(req, res) {
        try {
            var person = await usuario.findOne({
                where: { external_id: req.params.external },
            });

            if (!person) {
                return res.status(404).json({ tag: "Usuario no encontrado", code: 404 });
            }


            const listar = await recordatorio.findAll({
                attributes: ['nombre', 'estado', 'fecha', 'hora', 'external_id'],
                include: [
                    { model: grupo, as: 'grupo', attributes: ['external_id', 'nombre'] },
                ],
                where: { id_usuario: person.id },
            });


            if (listar.length === 0) { // Si no hay grupos creados
                return res.json({ tag: "No hay recordatorios disponibles", code: 200, info: [] });
            }

            return res.json({ tag: "OK!", code: 200, info: listar });

        } catch (error) {
            console.error('Error al obtener recordatorios:', error);
            return res.status(500).json({ tag: "Error al obtener los recordatorios del usuario", code: 500, error: error.message });
        }
    }

    //METODO DE REGISTRO RECORDATORIO
    async guardar(req, res) {
        console.log("aqui recordatorio")
        let transaction;
        try {
            const g = await grupo.findOne({ where: { external_id: req.body.grupo } });
            const u = await usuario.findOne({ where: { external_id: req.body.usuario } });
            const m = await mensaje.findOne({ where: { external_id: req.body.mensaje } });

            // Verificar si los registros existen
            if (!g) return res.status(404).json({ msg: "Grupo no encontrado", code: 404 });
            if (!u) return res.status(404).json({ msg: "Usuario no encontrado", code: 404 });
            if (!m) return res.status(404).json({ msg: "Mensaje no encontrado", code: 404 });

            const data = {
                nombre: req.body.nombre,
                fecha: req.body.fecha,
                hora: req.body.hora+':00',
                id_mensaje: m.id,
                id_usuario: u.id,
                id_grupo: g.id,
            };

            console.log(data);

            // Iniciar transacción fuera del bloque try
            transaction = await models.sequelize.transaction();

            // Crear recordatorio en la base de datos
            let result = await recordatorio.create(data, { transaction });
            if (!result) {
                res.status(204).json({ msg: "RECORDATORIO NO CREADO", code: 204 });
            } else {
                // Commit de la transacción
                await transaction.commit();
                res.status(200).json({ msg: "RECORDATORIO CREADO CON EXITO", code: 200 });
            }

        } catch (error) {
            if (transaction) await transaction.rollback();
            console.error(error);

            const errorMsg = error.errors && error.errors[0] && error.errors[0].message
                ? error.errors[0].message
                : error.message || "Error desconocido";

            // Ajustar código de error según el tipo de error
            const errorCode = error.status || 500;
            res.status(errorCode).json({ msg: errorMsg, code: errorCode });
        }
    }


}

module.exports = RecordatorioController;
