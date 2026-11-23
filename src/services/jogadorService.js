/**
 * Service de Jogadores: regras de negócio e acesso a dados via Sequelize.
 */
const { Jogador } = require('../models');
const ErroApi = require('../utils/ErroApi');
const { POSICOES, paraBooleano, validarId } = require('../utils/validacoes');

/**
 * Valida e normaliza os campos de jogador recebidos no corpo da requisição.
 * Quando "parcial" for true, apenas os campos enviados são validados.
 */
function validarDadosJogador(dados, parcial = false) {
  const erros = [];
  const resultado = {};

  if (dados.nome !== undefined || !parcial) {
    if (typeof dados.nome !== 'string' || dados.nome.trim() === '') {
      erros.push({ campo: 'nome', mensagem: 'O campo "nome" é obrigatório e deve ser um texto não vazio.' });
    } else {
      resultado.nome = dados.nome.trim();
    }
  }

  if (dados.posicao !== undefined || !parcial) {
    const posicao = typeof dados.posicao === 'string' ? dados.posicao.trim().toUpperCase() : dados.posicao;
    if (!POSICOES.includes(posicao)) {
      erros.push({ campo: 'posicao', mensagem: 'Posição inválida. Use G (Goleiro), Z (Zagueiro), M (Meio-campo) ou A (Atacante).' });
    } else {
      resultado.posicao = posicao;
    }
  }

  if (dados.ativo !== undefined) {
    const ativo = paraBooleano(dados.ativo);
    if (ativo === undefined) {
      erros.push({ campo: 'ativo', mensagem: 'O campo "ativo" deve ser booleano (true ou false).' });
    } else {
      resultado.ativo = ativo;
    }
  }

  if (erros.length > 0) {
    throw new ErroApi(400, 'Dados do jogador inválidos.', erros);
  }

  return resultado;
}

/**
 * Cadastra um novo jogador (Model.create).
 */
async function cadastrarJogador(dados) {
  const campos = validarDadosJogador(dados);
  return Jogador.create(campos);
}

/**
 * Lista os jogadores (Model.findAll), com filtro opcional por status "ativo".
 */
async function listarJogadores(filtros = {}) {
  const where = {};

  if (filtros.ativo !== undefined) {
    const ativo = paraBooleano(filtros.ativo);
    if (ativo === undefined) {
      throw new ErroApi(400, 'O filtro "ativo" deve ser true ou false.');
    }
    where.ativo = ativo;
  }

  return Jogador.findAll({ where, order: [['nome', 'ASC']] });
}

/**
 * Busca um jogador pelo ID (Model.findByPk); lança 404 se não existir.
 */
async function buscarJogadorPorId(idInformado) {
  const id = validarId(idInformado);
  const jogador = await Jogador.findByPk(id);

  if (!jogador) {
    throw new ErroApi(404, `Jogador com id ${id} não encontrado.`);
  }

  return jogador;
}

/**
 * Atualiza os dados de um jogador (instancia.update).
 */
async function atualizarJogador(idInformado, dados) {
  const jogador = await buscarJogadorPorId(idInformado);
  const campos = validarDadosJogador(dados, true);

  if (Object.keys(campos).length === 0) {
    throw new ErroApi(400, 'Informe ao menos um campo para atualizar: nome, posicao ou ativo.');
  }

  return jogador.update(campos);
}

/**
 * Desativa logicamente um jogador (ativo = false), preservando todo o histórico de treinos.
 */
async function desativarJogador(idInformado) {
  const jogador = await buscarJogadorPorId(idInformado);

  if (!jogador.ativo) {
    return { jogador, jaEstavaInativo: true };
  }

  await jogador.update({ ativo: false });
  return { jogador, jaEstavaInativo: false };
}

module.exports = {
  cadastrarJogador,
  listarJogadores,
  buscarJogadorPorId,
  atualizarJogador,
  desativarJogador
};
