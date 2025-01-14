const { destinatario } = require('../models');

// crear destinatario
exports.create = async (req, res) => {
    try {
        // Verificar si el destinatario ya existe
        const existingDestinatario = await destinatario.findOne({ where: { correo: req.body.correo } });
        if (existingDestinatario) {
            return res.status(400).send({ message: 'El destinatario ya existe' });
        }

        const Destinatario = await destinatario.create(req.body);
        res.status(201).send(Destinatario);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
};

// listar destinatarios
exports.findAll = async (req, res) => {
    try {
        const Destinatarios = await destinatario.findAll();
        res.status(200).send(Destinatarios);
    } catch (error) {
        res.status(500).send(error);
    }
};

// obtener destinatario por ID
exports.findOne = async (req, res) => {
    try {
        const Destinatario = await destinatario.findByPk(req.params.id);
        if (!Destinatario) {
            return res.status(404).send({ message: 'Destinatario no encontrado' });
        }
        res.status(200).send(Destinatario);
    } catch (error) {
        res.status(500).send(error);
    }
};

//obtener destinatario por uuid
exports.findOneUUID = async (req, res) => {
    try {
        const Destinatario = await destinatario.findOne({ where: { external_id: req.params.uuid } });
        if (!Destinatario) {
            return res.status(404).send({ message: 'Destinatario no encontrado' });
        }
        res.status(200).send(Destinatario);
    } catch (error) {
        res.status(500).send(error);
    }
};

// actualizar a destinatario por ID
exports.update = async (req, res) => {
    try {
        const Destinatario = await destinatario.findByPk(req.params.id);
        if (!Destinatario) {
            return res.status(404).send();
        }
        await Destinatario.update(req.body);
        res.status(200).send(Destinatario);
    } catch (error) {
        res.status(400).send(error);
    }
};

//actualizar a destinatario por uuid
exports.updateUUID = async (req, res) => {
    try {
        const Destinatario = await destinatario.findOne({ where: { external_id: req.params.uuid } });
        if (!Destinatario) {
            return res.status(404).send();
        }
        await Destinatario.update(req.body);
        res.status(200).send(Destinatario);
    } catch (error) {
        res.status(400).send(error);
    }
};

// borrar a destinatario por ID
exports.delete = async (req, res) => {
    try {
        const Destinatario = await destinatario.findByPk(req.params.id);
        if (!Destinatario) {
            return res.status(404).send();
        }
        await Destinatario.destroy();
        res.status(200).send(Destinatario);
    } catch (error) {
        res.status(500).send(error);
    }
};

// borrar a destinatario por uuid
exports.deleteUUID = async (req, res) => {
    try {
        const Destinatario = await destinatario.findOne({ where: { external_id: req.params.uuid } });
        if (!Destinatario) {
            return res.status(404).send();
        }
        await Destinatario.destroy();
        res.status(200).send(Destinatario);
    } catch (error) {
        res.status(500).send(error);
    }
};