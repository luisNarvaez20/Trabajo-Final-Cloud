'use strict';

module.exports = (sequelize, DataTypes) => {
    const grupo = sequelize.define('grupo', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
        nombre: { type: DataTypes.STRING(255), defaultValue: "NO_DATA" },
        tipo: { type: DataTypes.STRING(255), defaultValue: "NO_DATA" },
        
    }, {
        freezeTableName: true
    });

    grupo.associate = function (models){
        grupo.belongsTo(models.usuario, { foreignKey: 'id_usuario' });
        grupo.hasMany(models.destinatario, { foreignKey: 'id_grupo', as: 'destinatario'});
    }
    return grupo;
};