var express = require('express');
var router = express.Router();

let jwt = require('jsonwebtoken');

const { body, validationResult } = require('express-validator');

const UsuarioController = require('../app/controls/UsuarioController');
var usuarioController = new UsuarioController();
const CuentaController = require('../app/controls/CuentaController');
var cuentaController = new CuentaController();
const GrupoController = require('../app/controls/GrupoController');
var grupoController = new GrupoController();
const DestinatarioController = require('../app/controls/DestinatarioController');
var destinatarioController = new DestinatarioController();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

var auth = function middleware(req, res, next) {
  const token = req.headers['x-api-token'];
  if (token) {
    require('dotenv').config();
    const llave = process.env.KEY_SQ;

    jwt.verify(token, llave, async (err, decoded) => {
      if (err) {
        res.status(401);
        res.json({
          msg: "TOKEN NO VALIDO",
          code: 401
        });
      } else {
        var models = require('../models');
        var cuenta = models.cuenta;
        req.decoded = decoded;
        let aux = await cuenta.findOne({ where: { external_id: req.decoded.external } })
        if (aux === null) {
          res.status(401);
          res.json({
            msg: "TOKEN NO VALIDO O EXPIRADO",
            code: 401
          });
        } else {
          next();
        }
      }
    });
  } else {
    res.status(401);
    res.json({
      msg: "NO EXISTE TOKEN",
      code: 401
    });
  }

}

/*-----------------------------------------------------------------RUTAS------------------------------------------------------------------*/

/*CUENTA CONTROLLER */
router.post('/cuenta/sesion', [
  body('user', 'Ingrese un usuario').trim().exists().not().isEmpty(),
  body('clave', 'Ingrese una clave').trim().exists().not().isEmpty(),
], cuentaController.sesion);

/*PERSONA CONTROLLER*/
router.post('/persona/registrar', usuarioController.guardar);
router.post('/persona/modificar/:external', usuarioController.modificar);
router.get('/persona/obtener/:external', usuarioController.obtener);

/*GRUPO CONTROLLER*/
router.post('/grupo/guardar', grupoController.guardar);
router.get('/grupo/listar/:external', grupoController.listar);
router.get('/grupo/listar/', grupoController.listarTodos);

/*DESTINATARIO CONTROLLER*/
router.post('/destinatario/guardar', destinatarioController.guardar);
router.get('/destinatario/listar/:external', destinatarioController.obtener);
router.get('/destinatario/listar/', destinatarioController.listar);
router.get('/destinatario/listar_grupo/:external', destinatarioController.listar_grupo);
router.post('/destinatario/editar/:external', destinatarioController.modificar);

module.exports = router;
