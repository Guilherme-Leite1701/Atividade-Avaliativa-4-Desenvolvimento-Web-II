/**
 * Conexão com o banco de dados MySQL.
 * Cria e exporta a instância única do Sequelize conforme o ambiente atual.
 */
const { Sequelize } = require('sequelize');
const configuracoes = require('./config');

const ambiente = process.env.NODE_ENV || 'development';
const config = configuracoes[ambiente];

const sequelize = new Sequelize(config.database, config.username, config.password, config);

module.exports = sequelize;
