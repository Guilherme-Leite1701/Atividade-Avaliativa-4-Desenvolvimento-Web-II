/**
 * Migration: cria a tabela "jogadores".
 */
'use strict';

module.exports = {
  // Cria a tabela de jogadores
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('jogadores', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      nome: {
        type: Sequelize.STRING(120),
        allowNull: false
      },
      posicao: {
        type: Sequelize.ENUM('G', 'Z', 'M', 'A'),
        allowNull: false
      },
      ativo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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

  // Remove a tabela de jogadores
  async down(queryInterface) {
    await queryInterface.dropTable('jogadores');
  }
};
