const { Destinatario } = require('../models');

// crear destinatario
exports.create = async (req, res) => {
    try {
        const destinatario = await Destinatario.create(req.body);
        res.status(201).send(destinatario);
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
};

// listar destinatarios
exports.findAll = async (req, res) => {
    try {
        const destinatarios = await Destinatario.findAll();
        res.status(200).send(destinatarios);
    } catch (error) {
        res.status(500).send(error);
    }
};

// obtener destinatario por ID
exports.findOne = async (req, res) => {
    try {
        const destinatario = await Destinatario.findByPk(req.params.id);
        if (!destinatario) {
            return res.status(404).send();
        }
        res.status(200).send(destinatario);
    } catch (error) {
        res.status(500).send(error);
    }
};

// actualizar a destinatario por ID
exports.update = async (req, res) => {
    try {
        const destinatario = await Destinatario.findByPk(req.params.id);
        if (!destinatario) {
            return res.status(404).send();
        }
        await destinatario.update(req.body);
        res.status(200).send(destinatario);
    } catch (error) {
        res.status(400).send(error);
    }
};

// borrar a destinatario por ID
exports.delete = async (req, res) => {
    try {
        const destinatario = await Destinatario.findByPk(req.params.id);
        if (!destinatario) {
            return res.status(404).send();
        }
        await destinatario.destroy();
        res.status(200).send(destinatario);
    } catch (error) {
        res.status(500).send(error);
    }
};