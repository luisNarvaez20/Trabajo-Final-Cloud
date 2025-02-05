'use strict';
const models = require('../models');
const schedule = require('node-schedule');
const axios = require('axios');

const recordatorio = models.recordatorio;
const mensaje = models.mensaje;
const destinatario = models.destinatario;

const obtenerFechaActual = () => {
    const fechaActual = new Date();
    return fechaActual.toISOString().split('T')[0];  // Formato YYYY-MM-DD
};

const obtenerHoraActual = () => {
    const ahora = new Date();
    ahora.setHours(ahora.getHours() - 5); // Restar 5 horas
    return ahora.toTimeString().split(' ')[0].slice(0, 5) + ":00"; // Formato HH:mm:00
};

const formatearFecha = (fecha) => {
    return fecha.toISOString().split('T')[0]; // Convierte Date a formato YYYY-MM-DD
};

const configurarJob = async () => {
    try {
        console.log("Job iniciado...");

        const cronExpression = `*/15 * * * * *`; // Cada 30 segundos

        schedule.scheduleJob(cronExpression, async function () {
            console.log("Ejecutando job...");

            try {
                const recor = await recordatorio.findAll();

                for (const elemento of recor) {
                    if (!elemento.estado) continue; // Si el recordatorio está inactivo, saltar

                    console.log(formatearFecha(elemento.fecha) + ' ' +obtenerFechaActual() + ' ' +elemento.hora + ' '+obtenerHoraActual());

                    if (formatearFecha(elemento.fecha) == obtenerFechaActual() && elemento.hora == obtenerHoraActual()) {

                        const mensa = await mensaje.findOne({ where: { id: elemento.id_mensaje } });

                        if (!mensa) {
                            console.error(`No se encontró el mensaje con id: ${elemento.id_mensaje}`);
                            continue;
                        }

                        // Obtener URL de Logic Apps desencriptada
                        if (!process.env.LOGIC_APPS_URL) {
                            console.error("ERROR: URL de Logic Apps no configurada");
                            continue;
                        }

                        // Obtener URL de Logic Apps desencriptandola por base64
                        const encryptedText = process.env.LOGIC_APPS_URL;
                        const decrypted = Buffer.from(encryptedText, "base64").toString("utf8");
                        let logicAppsUrl = decrypted;

                        // Buscar destinatarios del grupo
                        const destinatarios = await destinatario.findAll({ where: { id_grupo: mensa.id_grupo } });

                        if (!destinatarios || destinatarios.length === 0) {
                            console.error("No se encontraron destinatarios en el grupo");
                            continue;
                        }

                        // Extraer los correos de los destinatarios
                        const correosDestinatarios = destinatarios.map(dest => dest.correo).filter(correo => correo);

                        if (correosDestinatarios.length === 0) {
                            console.error("No hay correos válidos en el grupo");
                            continue;
                        }

                        // Enviar el mensaje a Logic Apps
                        const payload = {
                            asunto: "RECORDATORIO DE MENSAJE",
                            contenido: mensa.contenido,
                            destinatario: correosDestinatarios,
                            archivos: []
                        };

                        console.log(`Enviando solicitud a Logic Apps con payload:`, payload);
                

                        const response = await fetch(logicAppsUrl, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(payload)
                        });
 

                    

                        const data = {
                            nombre: elemento.nombre,
                            fecha: elemento.fecha,
                            hora: elemento.hora,
                            id_mensaje: elemento.id_mensaje,
                            id_usuario: elemento.id_usuario,
                            id_grupo: elemento.id_grupo,
                            estado: false
                        };

                        var result = await elemento.update(data);
                        if (result === null) {
                            console.log("Recordatorio no  Actualizado");
                        } else {
                            console.log("Recordatorio Actualizado");
                        }

                    }
                }

            } catch (error) {
                console.error("Error dentro del job:", error);
            }
        });

    } catch (error) {
        console.error("Error al configurar el job:", error);
    }
};

configurarJob();

class NotificarController {
    // Lógica del controlador
}

module.exports = NotificarController;
