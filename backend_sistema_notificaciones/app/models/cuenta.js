'use strict';

module.exports = (sequelize, DataTypes) => {
    const cuenta = sequelize.define('cuenta', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
        estado: { type: DataTypes.BOOLEAN,  defaultValue: true },
        user: { type: DataTypes.STRING(75), allowNull: false },
        clave: { type: DataTypes.STRING(250), allowNull: false }
    }, {
        freezeTableName: true
    });

    cuenta.associate = function (models) {
        cuenta.belongsTo(models.usuario, { foreignKey: 'id_usuario' });
    };

    return cuenta;
};
