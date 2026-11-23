/**
 * Controller de Treinos: registro, listagem e exclusão de sessões.
 */
const treinoService = require('../services/treinoService');
const { enviarSucesso, tratarErro } = require('../utils/respostas');

/**
 * POST /treinos — registra uma sessão de treino com carga calculada.
 */
async function registrar(req, res) {
  try {
    const { treino, calculo } = await treinoService.registrarTreino(req.body || {});
    return res.status(201).json({
      sucesso: true,
      mensagem: 'Treino registrado com sucesso.',
      calculo,
      dados: treino
    });
  } catch (erro) {
    return tratarErro(res, erro);
  }
}

/**
 * GET /treinos — lista sessões (filtros: jogadorId, tipo, dataInicio, dataFim).
 */
async function listar(req, res) {
  try {
    const treinos = await treinoService.listarTreinos(req.query);
    return enviarSucesso(res, 200, treinos);
  } catch (erro) {
    return tratarErro(res, erro);
  }
}

/**
 * GET /treinos/jogador/:id — lista as sessões de um atleta.
 */
async function listarPorJogador(req, res) {
  try {
    const treinos = await treinoService.listarTreinosPorJogador(req.params.id);
    return enviarSucesso(res, 200, treinos);
  } catch (erro) {
    return tratarErro(res, erro);
  }
}

/**
 * DELETE /treinos/:codigo — exclui uma sessão pelo código único.
 */
async function excluir(req, res) {
  try {
    const treino = await treinoService.excluirTreino(req.params.codigo);
    return enviarSucesso(res, 200, treino, 'Treino excluído com sucesso.');
  } catch (erro) {
    return tratarErro(res, erro);
  }
}

module.exports = { registrar, listar, listarPorJogador, excluir };
