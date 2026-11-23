/**
 * Definição das rotas da API REST.
 */
const { Router } = require('express');
const jogadorController = require('../controllers/jogadorController');
const configuracaoController = require('../controllers/configuracaoController');
const treinoController = require('../controllers/treinoController');
const relatorioController = require('../controllers/relatorioController');

const rotas = Router();

// Jogadores
rotas.post('/jogadores', jogadorController.cadastrar);
rotas.get('/jogadores', jogadorController.listar);
rotas.get('/jogadores/:id', jogadorController.buscarPorId);
rotas.put('/jogadores/:id', jogadorController.atualizar);
rotas.patch('/jogadores/:id/desativar', jogadorController.desativar);

// Configuração
rotas.get('/configuracao', configuracaoController.consultar);
rotas.put('/configuracao', configuracaoController.salvar);

// Treinos
rotas.post('/treinos', treinoController.registrar);
rotas.get('/treinos', treinoController.listar);
rotas.get('/treinos/jogador/:id', treinoController.listarPorJogador);
rotas.delete('/treinos/:codigo', treinoController.excluir);

// Relatórios
rotas.get('/relatorios/semanal', relatorioController.semanal);

module.exports = rotas;
