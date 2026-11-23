/**
 * Registro central dos models e de suas associações.
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Jogador = require('./Jogador')(sequelize, DataTypes);
const Treino = require('./Treino')(sequelize, DataTypes);
const Configuracao = require('./Configuracao')(sequelize, DataTypes);

// Um jogador possui vários treinos; o histórico é preservado (sem exclusão em cascata)
Jogador.hasMany(Treino, { foreignKey: 'jogadorId', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Treino.belongsTo(Jogador, { foreignKey: 'jogadorId' });

module.exports = {
  sequelize,
  Jogador,
  Treino,
  Configuracao
};
