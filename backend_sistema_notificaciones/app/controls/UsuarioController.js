'use strict';
const { validationResult } = require('express-validator');

var models = require('../models/');
var usuario = models.usuario;
var cuenta = models.cuenta;

const saltRounds = 8;
const bcrypt = require('bcrypt');


class UsuarioController {

    //METODO DE REGISTRO DE USUARIO
    async guardar(req, res) {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                res.status(400).json({ msg: "DATOS FALTANTES", code: 400, errors: errors });
                return;
            }

            const claveHash = (clave) => bcrypt.hashSync(clave, bcrypt.genSaltSync(saltRounds), null);

            // Validar Datos duplicados en la Base de datos
            const usuarioExistente = await cuenta.findOne({ where: { user: req.body.user } });
            const correoExistente = await usuario.findOne({ where: { correo: req.body.correo } });
            const telefonoExistente = await usuario.findOne({ where: { telefono: req.body.telefono } });

            if (correoExistente) {
                res.json({ msg: "Correo ya existe", code: 500 });
                return;
            } else if (telefonoExistente) {
                res.json({ msg: "Telefono ya existe", code: 500 });
                return;
            } else if (usuarioExistente) {
                res.json({ msg: "Usuario ya existe", code: 500 });
                return;
            }

            const data = {
                nombres: req.body.nombres,
                apellidos: req.body.apellidos,
                telefono: req.body.telefono,
                correo: req.body.correo,
                direccion: req.body.direccion,
                cuenta: { user: req.body.user, clave: claveHash(req.body.clave) }
            };

            console.log(data);

            let transaction = await models.sequelize.transaction();

            try {
                // Crear usuario en la base de datos
                await usuario.create(data, { include: [{ model: cuenta, as: "cuenta" },], transaction });

                await transaction.commit();
                res.status(200).json({ msg: "USUARIO CREADO CON EXITO", code: 200 });

            } catch (error) {
                if (transaction) await transaction.rollback();
                const errorMsg = error.errors && error.errors[0] && error.errors[0].message
                    ? error.errors[0].message
                    : error.message;
                res.json({ msg: errorMsg, code: 200 });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: "Error interno del servidor", code: 500 });
        }
    }

    //METODO PARA OBTENER DATOS DE UN USUARIO
    async obtener(req, res) {
        try {
            const listar = await usuario.findOne({
                attributes: ['apellidos', 'nombres', 'external_id', 'direccion', 'correo', 'telefono'],
                include: [
                    { model: cuenta, as: 'cuenta', attributes: ['external_id', 'user', 'estado'] },
                ],
                where: { external_id: req.params.external } // Utiliza req.params.external para obtener el external desde la URL
            });

            res.json({ msg: 'OK!', code: 200, info: listar });
        } catch (error) {
            console.error('Error al obtener el perfil de usuario:', error);
            res.status(500).json({ msg: 'Error al obtener el perfil de usuario', code: 500 });
        }
    }

    //METODO PARA MODIFICAR DATOS DE UN USUARIO
    async modificar(req, res) {

        var person = await usuario.findOne({
            where: { external_id: req.params.external },
            include: [
                { model: models.cuenta, as: "cuenta", attributes: ['external_id'] },
            ],
        });

        if (person === null || person === undefined) {
            res.status(400);
            res.json({ msg: "Error", tag: "El usuario a modificar no existe", code: 400 });
        } else {

            var claveHash = function (clave) {
                return bcrypt.hashSync(clave, bcrypt.genSaltSync(saltRounds));
            };

            var uuid = require('uuid');

            person.nombres = req.body.nombres,
                person.apellidos = req.body.apellidos,
                person.telefono = req.body.telefono,
                person.direccion = req.body.direccion,
                person.correo = req.body.correo,
                person.user = req.body.usuario,
                person.external = uuid.v4();

            var result2;

            if (req.body.clave !== '') {
                var cuentaAux = await cuenta.findOne({ where: { external_id: person.cuenta.external_id } });
                cuentaAux.clave = claveHash(req.body.clave);
                result2 = await cuentaAux.save();
            }

            if (req.body.correo !== '') {
                var cuentaAux = await cuenta.findOne({ where: { external_id: person.cuenta.external_id } });
                cuentaAux.correo = req.body.correo;
                result2 = await cuentaAux.save();
            }

            var result = await person.save();

            if (result === null || result2 === null) {
                res.status(400);
                res.json({ msg: "Error", tag: "No se han modificado los datos", code: 400 });
            } else {
                res.status(200);
                res.json({ msg: "Success", tag: "Datos modificados correctamente", code: 200 });
            }
        }
    }
}

module.exports = UsuarioController;