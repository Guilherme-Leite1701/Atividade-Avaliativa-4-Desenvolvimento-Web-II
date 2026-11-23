/**
 * Service de Configuração: limite máximo de carga semanal.
 * Mantém um registro vigente, que é criado na primeira vez e atualizado nas seguintes.
 */
const { Configuracao } = require('../models');
const ErroApi = require('../utils/ErroApi');
const { ehDataValida } = require('../utils/validacoes');

/**
 * Retorna a configuração vigente (registro mais recente) ou null se não houver.
 */
async function obterConfiguracaoVigente() {
  return Configuracao.findOne({ order: [['id', 'DESC']] });
}

/**
 * Cadastra ou atualiza o limite máximo semanal.
 * Retorna { configuracao, criada } para o controller decidir entre 201 e 200.
 */
async function salvarConfiguracao(dados) {
  const erros = [];
  const carga = typeof dados.cargaMaximaSemanal === 'string' && dados.cargaMaximaSemanal.trim() !== ''
    ? Number(dados.cargaMaximaSemanal)
    : dados.cargaMaximaSemanal;

  if (typeof carga !== 'number' || !Number.isFinite(carga) || carga <= 0) {
    erros.push({ campo: 'cargaMaximaSemanal', mensagem: 'O campo "cargaMaximaSemanal" é obrigatório e deve ser um número maior que zero.' });
  }

  if (dados.dataVigencia !== undefined && dados.dataVigencia !== null && !ehDataValida(dados.dataVigencia)) {
    erros.push({ campo: 'dataVigencia', mensagem: 'O campo "dataVigencia" deve estar no formato YYYY-MM-DD.' });
  }

  if (erros.length > 0) {
    throw new ErroApi(400, 'Dados de configuração inválidos.', erros);
  }

  const campos = { cargaMaximaSemanal: carga, dataVigencia: dados.dataVigencia ?? null };
  const existente = await obterConfiguracaoVigente();

  if (existente) {
    await existente.update(campos);
    return { configuracao: existente, criada: false };
  }

  const configuracao = await Configuracao.create(campos);
  return { configuracao, criada: true };
}

module.exports = {
  obterConfiguracaoVigente,
  salvarConfiguracao
};
