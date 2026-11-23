/**
 * Seeder: limite máximo de carga semanal = 250 pontos.
 * Com a massa de treinos, há atletas acima (em risco), abaixo e exatamente no limite (sem risco).
 */
'use strict';

const agora = new Date();

module.exports = {
  // Insere a configuração inicial
  async up(queryInterface) {
    await queryInterface.bulkInsert('configuracoes', [
      { id: 1, cargaMaximaSemanal: 250.0, dataVigencia: '2026-10-01', createdAt: agora, updatedAt: agora }
    ]);
  },

  // Remove a configuração inicial
  async down(queryInterface) {
    await queryInterface.bulkDelete('configuracoes', { id: 1 });
  }
};
