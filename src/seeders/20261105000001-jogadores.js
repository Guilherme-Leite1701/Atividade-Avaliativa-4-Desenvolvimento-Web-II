/**
 * Seeder: 7 jogadores (6 ativos cobrindo G, Z, M, A + 1 inativo para testes de falha).
 */
'use strict';

const agora = new Date();

const jogadores = [
  { id: 1, nome: 'Carlos Muralha', posicao: 'G', ativo: true },
  { id: 2, nome: 'Bruno Xerife', posicao: 'Z', ativo: true },
  { id: 3, nome: 'Lucas Firme', posicao: 'Z', ativo: true },
  { id: 4, nome: 'Diego Maestro', posicao: 'M', ativo: true },
  { id: 5, nome: 'Mateus Armador', posicao: 'M', ativo: true },
  { id: 6, nome: 'Rafael Artilheiro', posicao: 'A', ativo: true },
  { id: 7, nome: 'Pedro Afastado', posicao: 'A', ativo: false }
];

module.exports = {
  // Insere os jogadores de teste
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      'jogadores',
      jogadores.map((jogador) => ({ ...jogador, createdAt: agora, updatedAt: agora }))
    );
  },

  // Remove os jogadores de teste
  async down(queryInterface) {
    await queryInterface.bulkDelete('jogadores', { id: jogadores.map((j) => j.id) });
  }
};
