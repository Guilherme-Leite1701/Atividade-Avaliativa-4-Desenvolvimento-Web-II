/**
 * Controller de Jogadores: traduz requisições HTTP em chamadas ao service.
 */
const jogadorService = require('../services/jogadorService');
const { enviarSucesso, tratarErro } = require('../utils/respostas');

/**
 * POST /jogadores — cadastra um atleta.
 */
async function cadastrar(req, res) {
  try {
    const jogador = await jogadorService.cadastrarJogador(req.body || {});
    return enviarSucesso(res, 201, jogador, 'Jogador cadastrado com sucesso.');
  } catch (erro) {
    return tratarErro(res, erro);
  }
}

/**
 * GET /jogadores — lista atletas (filtro opcional ?ativo=true|false).
 */
async function listar(req, res) {
  try {
    const jogadores = await jogadorService.listarJogadores(req.query);
    return enviarSucesso(res, 200, jogadores);
  } catch (erro) {
    return tratarErro(res, erro);
  }
}

/**
 * GET /jogadores/:id — consulta um atleta pelo ID.
 */
async function buscarPorId(req, res) {
  try {
    const jogador = await jogadorService.buscarJogadorPorId(req.params.id);
    return enviarSucesso(res, 200, jogador);
  } catch (erro) {
    return tratarErro(res, erro);
  }
}

/**
 * PUT /jogadores/:id — atualiza um atleta.
 */
async function atualizar(req, res) {
  try {
    const jogador = await jogadorService.atualizarJogador(req.params.id, req.body || {});
    return enviarSucesso(res, 200, jogador, 'Jogador atualizado com sucesso.');
  } catch (erro) {
    return tratarErro(res, erro);
  }
}

/**
 * PATCH /jogadores/:id/desativar — desativa logicamente um atleta.
 */
async function desativar(req, res) {
  try {
    const { jogador, jaEstavaInativo } = await jogadorService.desativarJogador(req.params.id);
    const mensagem = jaEstavaInativo
      ? 'O jogador já estava inativo.'
      : 'Jogador desativado com sucesso. O histórico de treinos foi preservado.';
    return enviarSucesso(res, 200, jogador, mensagem);
  } catch (erro) {
    return tratarErro(res, erro);
  }
}

module.exports = { cadastrar, listar, buscarPorId, atualizar, desativar };
