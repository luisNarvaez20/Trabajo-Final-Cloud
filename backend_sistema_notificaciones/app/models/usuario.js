'use strict';

module.exports = (sequelize, DataTypes) => {
    const usuario = sequelize.define('usuario', {
        external_id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4},
        nombres: { type: DataTypes.STRING(50), defaultValue: "NO_DATA" },
        apellidos: { type: DataTypes.STRING(50), defaultValue: "NO_DATA" },
        correo: { type: DataTypes.STRING(50), defaultValue: "NO_DATA"},
        telefono:  { type: DataTypes.STRING(50), defaultValue: "NO_DATA"},
        direccion: {type: DataTypes.STRING(100), defaultValue: "NO_DATA"},
    }, {
        freezeTableName: true
    });
    usuario.associate = function (models){
        usuario.hasOne(models.cuenta, { foreignKey: 'id_usuario', as: 'cuenta'});
        usuario.hasMany(models.grupo, { foreignKey: 'id_usuario', as: 'grupo'});
        usuario.hasMany(models.mensaje, { foreignKey: 'id_usuario', as: 'mensaje'});
    }
    return usuario;
};