'use strict';

module.exports = (sequelize, DataTypes) => {
    const mensaje = sequelize.define('mensaje', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
        asunto: { type: DataTypes.STRING(255), defaultValue: "NO_DATA" },
        contenido: { type: DataTypes.TEXT, defaultValue: "NO_DATA" },
        tipo: { type: DataTypes.STRING(50), defaultValue: "NO_DATA" },
        fecha: { type: DataTypes.DATE },
        estado: { type: DataTypes.BOOLEAN, defaultValue: true },
    }, {
        freezeTableName: true  
    });

    mensaje.associate = function (models) {
       mensaje.belongsTo(models.usuario, { foreignKey: 'id_usuario' });

       mensaje.belongsTo(models.destinatario, { foreignKey: 'id_destinatario', as: 'destinatario'});

        mensaje.hasOne(models.archivo, {
            foreignKey: 'id_mensaje',
            as: 'archivo',         // Alias para acceder al archivo
            onDelete: 'SET NULL',  // Si se elimina el mensaje, el archivo queda con relación nula
            onUpdate: 'CASCADE'    // Si el mensaje se actualiza, se actualiza la relación
        });
    };

    return mensaje;
};
