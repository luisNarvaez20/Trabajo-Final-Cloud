'use strict';
const { body, validationResult, check } = require('express-validator');
var models = require('../models/');
var usuario = models.usuario;
var cuenta = models.cuenta;

const bcypt = require('bcrypt');
let jwt = require('jsonwebtoken');

class CuentaController {

    async sesion(req, res) {
        console.log("entro")
        let errors = validationResult(req);
        if (errors.isEmpty()) {
            var login = await cuenta.findOne({
                where: { user: req.body.user },
                include: [
                    {
                        model: usuario,
                        as: 'usuario',
                        attributes: ['apellidos', 'nombres','correo', 'external_id'],
                    }
                ]
            });            
            if (login === null) {
                res.status(400);
                res.json({
                    msg: "CUENTA NO ENCONTRADA",
                    code: 400
                });
            } else {
                res.status(200);
                var isClaveValida = function (clave, claveUser) {
                    return bcypt.compareSync(claveUser, clave);
                }
                if (login.estado == true) {
                    if (isClaveValida(login.clave, req.body.clave)) { //login.clave---BD //req.body.clave---lo que manda el correo
                        const tokenData = {
                            external: login.external_id,
                            user: login.user,
                            check: true
                        };
                        require('dotenv').config();
                        const llave = process.env.KEY_SQ;
                        const token = jwt.sign(tokenData, llave, {
                            expiresIn: '12h'
                        });

                        res.json({
                            token: token,
                            user: login.usuario.nombres + ' ' + login.usuario.apellidos,
                            msg: "Bienvenid@ " + login.usuario.nombres + ' ' + login.usuario.apellidos,
                            usuario: login.user,
                            correo: login.usuario.correo,
                            external_id: login.usuario.external_id,
                            code: 200
                        });

                    } else {
                        res.json({
                            msg: "CLAVE INCORRECTA",
                            code: 201
                        });
                    }
                } else if (login.estado == false) {
                    res.json({
                        msg: "CUENTA NO SE ENCUENTRA ACTIVA",
                        code: 201
                    });
                } else {
                    res.json({
                        msg: "NO EXISTE ESA CUENTA",
                        code: 201
                    });
                }
            }
        } else {
            res.status(400);
            res.json({ msg: "Datos faltantes", code: 400, errors: errors });
        }
    }
    
}
module.exports = CuentaController;