'use strict';

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const dotenv = require('dotenv');
const DestinatarioController = require('../controls/DestinatarioController');
var destinatarioController = new DestinatarioController();

dotenv.config();

let SCOPES = process.env.SCOPES;
let TOKEN_PATH = Buffer.from(process.env.TOKEN_PATH, "base64").toString("utf8");;
let CREDENTIALS_PATH = Buffer.from(process.env.CREDENTIALS_PATH, "base64").toString("utf8");;

function getAuthUrl(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    return authUrl;
}

class RecibMensajesControl {

    async obtenerToken(req, res) {
        const credentials = JSON.parse(CREDENTIALS_PATH);
        const { client_secret, client_id, redirect_uris } = credentials.web;

        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

        // Generar la URL de autorización
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });

        // Devolver la URL de autorización
        res.json({
            message: 'Por favor, autoriza la aplicación.',
            authUrl: authUrl
        });
    }

    // Método para recibir los mensajes después de autenticarte
    async recibirMensajes(req, res) {
        try {

            // Leer el token guardado
            if (!TOKEN_PATH) {
                return res.status(401).json({ message: "No se encontró un token. Autentícate primero." });
            }
    
            const credentials = JSON.parse(CREDENTIALS_PATH);
            const { client_secret, client_id, redirect_uris } = credentials.web;
    
            const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
            const tokens = JSON.parse(TOKEN_PATH);
            oAuth2Client.setCredentials(tokens);
    
            if (oAuth2Client.isTokenExpiring()) {
                console.log("El token ha caducado, obteniendo uno nuevo...");
                const { credentials: refreshedTokens } = await oAuth2Client.refreshAccessToken();
                oAuth2Client.setCredentials(refreshedTokens);
            }
    
            const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
            const remitentesPermitidos = await destinatarioController.listarCorreosDestinatarios();
            const fechaFiltro = "after:2025/01/31";
            const query = remitentesPermitidos.map(email => `from:${email}`).join(" OR ") + ` ${fechaFiltro}`;
            const response = await gmail.users.messages.list({ userId: 'me', maxResults: 5, q: query });
    
            if (!response.data.messages) {
                return res.status(200).json({ message: "No hay correos nuevos." });
            }
    
            const emails = [];
            for (let msg of response.data.messages) {
                const message = await gmail.users.messages.get({ userId: 'me', id: msg.id });
                const headers = message.data.payload.headers;
                const from = headers.find(header => header.name === 'From')?.value || "Desconocido";
                const subject = headers.find(header => header.name === 'Subject')?.value || "Sin Asunto";
                const snippet = message.data.snippet;
    
                // Manejo de archivos adjuntos
                let attachments = [];
                if (message.data.payload.parts) {
                    for (const part of message.data.payload.parts) {
                        if (part.filename && part.body.attachmentId) {
                            const attachment = await gmail.users.messages.attachments.get({
                                userId: 'me',
                                messageId: msg.id,
                                id: part.body.attachmentId
                            });
    
                            const fileData = attachment.data.data;
                            const fileUrl = `data:${part.mimeType};base64,${fileData}`;
    
                            attachments.push({
                                filename: part.filename,
                                fileUrl: fileUrl
                            });
                        }
                    }
                }
    
                emails.push({ from, subject, snippet, attachments });
            }
    
            res.json({ emails });
    
        } catch (error) {
            console.error("Error al obtener los mensajes:", error);
            res.status(500).json({ message: "Error al obtener los correos.", error: error.message });
        }
    }    
    
}

module.exports = RecibMensajesControl;  // Exportar la instancia de la clase
