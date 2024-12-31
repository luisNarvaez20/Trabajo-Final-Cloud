'use strict';

module.exports = (sequelize, DataTypes) => {
    const destinatario = sequelize.define('destinatario', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
        nombres: { type: DataTypes.STRING(50), defaultValue: "NO_DATA" },
        apellidos: { type: DataTypes.STRING(50), defaultValue: "NO_DATA" },
        correo: { type: DataTypes.STRING(50), defaultValue: "NO_DATA"},
        
    }, {
        freezeTableName: true
    });

    destinatario.associate = function (models) {
        destinatario.belongsTo(models.grupo, { foreignKey: 'id_grupo' });
        destinatario.belongsTo(models.mensaje, { foreignKey: 'id_mensaje' });
    };

    return destinatario;
};
