/**
 * Seeder: 24 treinos em duas semanas, cobrindo os tipos F, T e E.
 *
 * Semana 1 (26/10/2026 a 01/11/2026) — limite 250:
 *   Diego 277,50 (RISCO) | Mateus 122,40 | Lucas 115,20 | Bruno 92,40 | Rafael 73,20 | Carlos 20,00
 * Semana 2 (02/11/2026 a 08/11/2026) — limite 250:
 *   Rafael 258,90 (RISCO) | Bruno 250,00 (no limite, SEM risco) | Diego 135,45 |
 *   Carlos 60,00 e Lucas 60,00 (empate na menor carga) | Mateus não treinou (fora dos rankings)
 */
'use strict';

const { calcularCarga } = require('../services/cargaService');

const agora = new Date();

const treinos = [
  // Semana 1
  { codigo: 'TR-0001', jogadorId: 6, dataTreino: '2026-10-26', tipo: 'T', duracaoMin: 60, intensidade: 6 },
  { codigo: 'TR-0002', jogadorId: 6, dataTreino: '2026-10-29', tipo: 'E', duracaoMin: 60, intensidade: 5 },
  { codigo: 'TR-0003', jogadorId: 4, dataTreino: '2026-10-26', tipo: 'F', duracaoMin: 90, intensidade: 9 },
  { codigo: 'TR-0004', jogadorId: 4, dataTreino: '2026-10-28', tipo: 'F', duracaoMin: 80, intensidade: 9 },
  { codigo: 'TR-0005', jogadorId: 4, dataTreino: '2026-10-31', tipo: 'T', duracaoMin: 50, intensidade: 8 },
  { codigo: 'TR-0006', jogadorId: 5, dataTreino: '2026-10-27', tipo: 'F', duracaoMin: 60, intensidade: 8 },
  { codigo: 'TR-0007', jogadorId: 5, dataTreino: '2026-10-30', tipo: 'T', duracaoMin: 60, intensidade: 7 },
  { codigo: 'TR-0008', jogadorId: 1, dataTreino: '2026-11-01', tipo: 'E', duracaoMin: 40, intensidade: 5 },
  { codigo: 'TR-0009', jogadorId: 2, dataTreino: '2026-10-27', tipo: 'T', duracaoMin: 70, intensidade: 6 },
  { codigo: 'TR-0010', jogadorId: 2, dataTreino: '2026-10-30', tipo: 'E', duracaoMin: 60, intensidade: 7 },
  { codigo: 'TR-0011', jogadorId: 3, dataTreino: '2026-10-28', tipo: 'F', duracaoMin: 60, intensidade: 8 },
  { codigo: 'TR-0012', jogadorId: 3, dataTreino: '2026-10-31', tipo: 'T', duracaoMin: 60, intensidade: 6 },

  // Semana 2
  { codigo: 'TR-0013', jogadorId: 6, dataTreino: '2026-11-02', tipo: 'F', duracaoMin: 90, intensidade: 9 },
  { codigo: 'TR-0014', jogadorId: 6, dataTreino: '2026-11-03', tipo: 'F', duracaoMin: 60, intensidade: 8 },
  { codigo: 'TR-0015', jogadorId: 6, dataTreino: '2026-11-05', tipo: 'T', duracaoMin: 60, intensidade: 7 },
  { codigo: 'TR-0016', jogadorId: 6, dataTreino: '2026-11-08', tipo: 'E', duracaoMin: 30, intensidade: 5 },
  { codigo: 'TR-0017', jogadorId: 4, dataTreino: '2026-11-02', tipo: 'T', duracaoMin: 60, intensidade: 6 },
  { codigo: 'TR-0018', jogadorId: 4, dataTreino: '2026-11-04', tipo: 'E', duracaoMin: 90, intensidade: 5 },
  { codigo: 'TR-0019', jogadorId: 4, dataTreino: '2026-11-06', tipo: 'F', duracaoMin: 45, intensidade: 7 },
  { codigo: 'TR-0020', jogadorId: 1, dataTreino: '2026-11-03', tipo: 'T', duracaoMin: 60, intensidade: 5 },
  { codigo: 'TR-0021', jogadorId: 1, dataTreino: '2026-11-06', tipo: 'E', duracaoMin: 60, intensidade: 4 },
  { codigo: 'TR-0022', jogadorId: 2, dataTreino: '2026-11-02', tipo: 'F', duracaoMin: 100, intensidade: 10 },
  { codigo: 'TR-0023', jogadorId: 2, dataTreino: '2026-11-05', tipo: 'E', duracaoMin: 100, intensidade: 10 },
  { codigo: 'TR-0024', jogadorId: 3, dataTreino: '2026-11-07', tipo: 'E', duracaoMin: 60, intensidade: 10 }
];

module.exports = {
  // Insere os treinos calculando a carga com a mesma regra usada pela API
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      'treinos',
      treinos.map((treino) => ({
        ...treino,
        carga: calcularCarga(treino.duracaoMin, treino.intensidade, treino.tipo),
        createdAt: agora,
        updatedAt: agora
      }))
    );
  },

  // Remove os treinos de teste
  async down(queryInterface) {
    await queryInterface.bulkDelete('treinos', { codigo: treinos.map((t) => t.codigo) });
  }
};
