/**
 * Migration: cria a tabela "treinos" com chave estrangeira para "jogadores".
 * onDelete RESTRICT garante que o histórico de treinos nunca seja apagado em cascata.
 */
'use strict';

module.exports = {
  // Cria a tabela de treinos e seus índices
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('treinos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      codigo: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      jogadorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'jogadores', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      dataTreino: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      tipo: {
        type: Sequelize.ENUM('F', 'T', 'E'),
        allowNull: false
      },
      duracaoMin: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      intensidade: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      carga: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
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

    await queryInterface.addIndex('treinos', ['dataTreino'], { name: 'idx_treinos_data' });
    await queryInterface.addIndex('treinos', ['jogadorId', 'dataTreino'], { name: 'idx_treinos_jogador_data' });
  },

  // Remove a tabela de treinos
  async down(queryInterface) {
    await queryInterface.dropTable('treinos');
  }
};
