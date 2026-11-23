/**
 * Migration: cria a tabela "configuracoes" (limite máximo de carga semanal).
 */
'use strict';

module.exports = {
  // Cria a tabela de configurações
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('configuracoes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      cargaMaximaSemanal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      dataVigencia: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  // Remove a tabela de configurações
  async down(queryInterface) {
    await queryInterface.dropTable('configuracoes');
  }
};
