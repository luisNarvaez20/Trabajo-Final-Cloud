'use strict';
const { validationResult } = require('express-validator');

var models = require('../models/');
var usuario = models.usuario;
var grupo = models.grupo;



class GrupoController {

    async guardar(req, res) {
        try {
            const errors = validationResult(req);
    
            if (!errors.isEmpty()) {
                return res.status(400).json({ msg: "DATOS FALTANTES", code: 400, errors: errors.array() });
            }
    
            // Verificar si external_id está presente
            if (!req.body.external) {
                return res.status(400).json({ msg: "External ID es requerido", code: 400 });
            }
    
            const person = await usuario.findOne({
                where: { external_id: req.body.external }
            });
    
            // Verificar si el usuario existe
            if (!person) {
                return res.status(404).json({ msg: "Usuario no encontrado", code: 404 });
            }
    
            // Crear datos del grupo
            const data = {
                nombre: req.body.nombre,
                tipo: req.body.tipo,
                id_usuario: person.id
            };
    
            // Iniciar transacción
            let transaction = await models.sequelize.transaction();
    
            try {
                // Crear grupo en la base de datos dentro de la transacción
                await grupo.create(data, { transaction });
    
                // Confirmar transacción
                await transaction.commit();
                return res.status(200).json({ msg: "GRUPO CREADO CON ÉXITO", code: 200 });
    
            } catch (error) {
                // Revertir transacción en caso de error
                if (transaction) await transaction.rollback();
    
                console.error("Error al crear grupo:", error);
                return res.status(500).json({ msg: "Error al crear el grupo", code: 500, error: error.message });
            }
    
        } catch (error) {
            console.error("Error interno en guardar grupo:", error);
            return res.status(500).json({ msg: "Error interno del servidor", code: 500, error: error.message });
        }
    }
    

    // LISTAR GRUPOS POR USUARIO
    async listar(req, res) {

        try {
            var person = await usuario.findOne({
                where: { external_id: req.params.external },
            });

            if (!person) {
                return res.status(404).json({ msg: "Usuario no encontrado", code: 404 });
            }

            const listar = await grupo.findAll({
                attributes: ['nombre', 'tipo', 'external_id'],
            });

            if (listar.length === 0) { // Si no hay grupos creados
                return res.json({ msg: "No hay grupos disponibles", code: 200, info: [] });
            }

            return res.json({ msg: "OK!", code: 200, info: listar });

        } catch (error) {
            console.error('Error al obtener grupos:', error);
            return res.status(500).json({ msg: "Error al obtener los grupos del usuario", code: 500, error: error.message });
        }
    }
}

module.exports = GrupoController;