'use strict';

module.exports = (sequelize, DataTypes) => {
    const mensaje = sequelize.define('mensaje', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
        asunto: { type: DataTypes.STRING(255), defaultValue: "NO_DATA" },
        contenido: { type: DataTypes.TEXT, defaultValue: "NO_DATA" },
        tipo: { type: DataTypes.STRING(50), defaultValue: "NO_DATA" },
        fecha: { type: DataTypes.DATE},
        estado:  { type: DataTypes.BOOLEAN, defaultValue: true},
    }, {
        freezeTableName: true  
    });

    mensaje.associate = function (models){
        mensaje.belongsTo(models.usuario, { foreignKey: 'id_usuario' });
        mensaje.hasMany(models.destinatario, { foreignKey: 'id_mensaje', as: 'destinatario'});
        mensaje.hasOne(models.archivo, { foreignKey: 'id_mensaje', as: 'archivo'});
    }

    return mensaje;
};
