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
const MensajeController = require('../app/controls/MensajeController');
var mensajeController = new MensajeController();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//Middleware para autenticacion 
var auth = function middleware(req, res, next) {
  const token = req.headers["token-api"];
  if (token) {
    require("dotenv").config();
    const llave = process.env.KEY_SQ;
    jwt.verify(token, llave, async (err, decoded) => {
      if (err) {
        res.status(401);
        res.json({ tag: "token expirado o no valido", code: 401 });
      } else {
        var models = require("../app/models");
        req.decoded = decoded;
        let aux = await models.cuenta.findOne({
          where: { external_id: req.decoded.external },
        });
        if (!aux) {
          res.status(401);
          res.json({ tag: "token no valido", code: 401 });
        } else {
          next();
        }
      }
    });
  } else {
    res.status(401);
    res.json({ tag: "No existe token", code: 401 });
  }
};


/*-----------------------------------------------------------------RUTAS------------------------------------------------------------------*/

/*CUENTA CONTROLLER */
router.post('/cuenta/sesion', [
  body('user', 'Ingrese un usuario').trim().exists().not().isEmpty(),
  body('clave', 'Ingrese una clave').trim().exists().not().isEmpty(),
], cuentaController.sesion);

/*PERSONA CONTROLLER*/
router.post('/persona/registrar', usuarioController.guardar);
router.post('/persona/modificar/:external',auth, usuarioController.modificar);
router.get('/persona/obtener/:external',auth, usuarioController.obtener);

/*GRUPO CONTROLLER*/
router.post('/grupo/guardar',auth, grupoController.guardar);
router.get('/grupo/listar/:external',auth, grupoController.listar);
router.get('/grupo/listar/',auth, grupoController.listarTodos);

/*DESTINATARIO CONTROLLER*/
router.post('/destinatario/guardar', auth, destinatarioController.guardar);
router.get('/destinatario/listar/:external', auth, destinatarioController.obtener);
router.get('/destinatario/listar/', auth, destinatarioController.listar);
router.get('/destinatario/listar_grupo/:external', auth, destinatarioController.listar_grupo);
router.post('/destinatario/editar/:external', auth, destinatarioController.modificar);

/*MENSAJE CONTROLLER*/
router.post('/mensaje/guardar', auth, mensajeController.guardar);
router.post('/mensaje/guardar_archivo', auth, mensajeController.guardar_archivo);

module.exports = router;
