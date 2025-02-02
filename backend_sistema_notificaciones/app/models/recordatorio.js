'use strict';

module.exports = (sequelize, DataTypes) => {
    const recordatorio = sequelize.define('recordatorio', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
        nombre: { type: DataTypes.STRING(255), defaultValue: "NO_DATA" },
        hora: { type: DataTypes.TIME, defaultValue: '00:00:00' },
        fecha: { type: DataTypes.DATE },
        estado: { type: DataTypes.BOOLEAN, defaultValue: true },
    }, {
        freezeTableName: true  
    });

    recordatorio.associate = function (models) {
        recordatorio.belongsTo(models.usuario, { foreignKey: 'id_usuario', as: 'usuario' });
        recordatorio.belongsTo(models.mensaje, { foreignKey: 'id_mensaje', as: 'mensaje' });
        recordatorio.belongsTo(models.grupo, { foreignKey: 'id_grupo', as: 'grupo' });
    };

    return recordatorio;
};
