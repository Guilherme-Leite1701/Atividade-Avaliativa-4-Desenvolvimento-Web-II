/**
 * Controller de Configuração: consulta e gravação do limite semanal.
 */
const configuracaoService = require('../services/configuracaoService');
const ErroApi = require('../utils/ErroApi');
const { enviarSucesso, tratarErro } = require('../utils/respostas');

/**
 * GET /configuracao — retorna o limite máximo semanal vigente.
 */
async function consultar(req, res) {
  try {
    const configuracao = await configuracaoService.obterConfiguracaoVigente();
    if (!configuracao) {
      throw new ErroApi(404, 'Nenhuma configuração cadastrada. Use PUT /configuracao para definir o limite.');
    }
    return enviarSucesso(res, 200, configuracao);
  } catch (erro) {
    return tratarErro(res, erro);
  }
}

/**
 * PUT /configuracao — cadastra (201) ou atualiza (200) o limite máximo semanal.
 */
async function salvar(req, res) {
  try {
    const { configuracao, criada } = await configuracaoService.salvarConfiguracao(req.body || {});
    return criada
      ? enviarSucesso(res, 201, configuracao, 'Configuração cadastrada com sucesso.')
      : enviarSucesso(res, 200, configuracao, 'Configuração atualizada com sucesso.');
  } catch (erro) {
    return tratarErro(res, erro);
  }
}

module.exports = { consultar, salvar };
