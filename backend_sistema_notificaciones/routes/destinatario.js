var express = require('express');
var router = express.Router();
var destinatario = require('../app/controllers/destinatarioController');

// Crear un nuevo destinatario
router.post('/create', destinatario.create);

// Listar todos los destinatarios
router.get('/findAll', destinatario.findAll);

// Obtener un destinatario por ID
router.get('/findOne/:id', destinatario.findOne);

// Actualizar un destinatario por ID
router.put('/update/:id', destinatario.update);

// Borrar un destinatario por ID
router.delete('/delete/:id', destinatario.delete);

module.exports = router;
