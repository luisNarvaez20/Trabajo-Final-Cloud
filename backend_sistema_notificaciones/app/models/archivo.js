'use strict';

module.exports = (sequelize, DataTypes) => {
    const archivo = sequelize.define('archivo', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
        nombre: { type: DataTypes.STRING(255), defaultValue: "NO_DATA" },
        tipo: { type: DataTypes.STRING(255), defaultValue: "NO_DATA" },
        dir: { type: DataTypes.STRING(255), defaultValue: "NO_DATA" },

    }, {
        freezeTableName: true
    });

    archivo.associate = function (models){
        archivo.belongsTo(models.mensaje, { foreignKey: 'id_mensaje'});
    }
    return archivo;
};