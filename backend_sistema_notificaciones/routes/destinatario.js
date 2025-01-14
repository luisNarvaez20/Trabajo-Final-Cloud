var express = require('express');
var router = express.Router();
var destinatario = require('../app/controllers/destinatarioController');

// Crear un nuevo destinatario
router.post('/create', destinatario.create);

// Listar todos los destinatarios
router.get('/findAll', destinatario.findAll);

// Obtener un destinatario por ID
router.get('/findOne/:id', destinatario.findOne);

// Obtener un destinatario por UUID
router.get('/findOne/uuid/:uuid', destinatario.findOneUUID);

// Actualizar un destinatario por ID
router.put('/update/:id', destinatario.update);

// Actualizar un destinatario por UUID
router.put('/update/uuid/:uuid', destinatario.updateUUID);

// Borrar un destinatario por ID
router.delete('/delete/:id', destinatario.delete);

// Borrar un destinatario por UUID
router.delete('/delete/uuid/:uuid', destinatario.deleteUUID);

module.exports = router;
