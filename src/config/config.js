/**
 * Configuração de ambientes do Sequelize.
 * Usada tanto pelo Sequelize CLI (migrations/seeders) quanto pela aplicação.
 * Todas as credenciais vêm do arquivo .env (nunca ficam fixas no código).
 */
require('dotenv').config();

const base = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD || null,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  dialect: 'mysql',
  timezone: '-03:00',
  logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  define: {
    timestamps: true
  }
};

module.exports = {
  development: { ...base },
  test: { ...base, database: `${process.env.DB_NAME}_test` },
  production: { ...base, logging: false }
};
