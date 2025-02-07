'use strict';

module.exports = (sequelize, DataTypes) => {
    const mensaje = sequelize.define('mensaje', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
        asunto: { type: DataTypes.STRING(255), defaultValue: "NO_DATA" },
        contenido: { type: DataTypes.TEXT, defaultValue: "NO_DATA" },
        tipo: { type: DataTypes.STRING(50), defaultValue: "NO_DATA" },
        remitente: { type: DataTypes.STRING(50), defaultValue: "NO_DATA" },
        resumen: { type: DataTypes.TEXT, defaultValue: "NO_DATA" },
        fecha: { type: DataTypes.DATE },
        estado: { type: DataTypes.BOOLEAN, defaultValue: true },
    }, {
        freezeTableName: true
    });

    mensaje.associate = function (models) {
        mensaje.belongsTo(models.usuario, { foreignKey: 'id_usuario' });
        mensaje.belongsTo(models.grupo, { foreignKey: 'id_grupo', as: 'grupo' });

        // Cambiar de hasOne a hasMany para permitir múltiples archivos adjuntos
        mensaje.hasMany(models.archivo, {
            foreignKey: 'id_mensaje',
            as: 'archivo',         // Alias para acceder a los archivos
            onDelete: 'CASCADE',    // Si se elimina el mensaje, se eliminan los archivos asociados
            onUpdate: 'CASCADE'     // Si se actualiza el mensaje, se actualizan los archivos
        });
    };

    return mensaje;
};

