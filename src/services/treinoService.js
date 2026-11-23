/**
 * Service de Treinos: registro, listagem com filtros e exclusão de sessões.
 */
const { Op } = require('sequelize');
const { Treino, Jogador } = require('../models');
const ErroApi = require('../utils/ErroApi');
const { calcularCarga, descreverCalculo } = require('./cargaService');
const { TIPOS, paraInteiro, ehDataValida, validarData, validarId } = require('../utils/validacoes');

const INCLUIR_JOGADOR = { model: Jogador, attributes: ['id', 'nome', 'posicao', 'ativo'] };

/**
 * Valida e normaliza os dados de entrada de um novo treino.
 */
function validarDadosTreino(dados) {
  const erros = [];

  const codigo = typeof dados.codigo === 'string' ? dados.codigo.trim() : '';
  if (codigo === '') {
    erros.push({ campo: 'codigo', mensagem: 'O campo "codigo" é obrigatório.' });
  }

  const jogadorId = paraInteiro(dados.jogadorId);
  if (Number.isNaN(jogadorId) || jogadorId <= 0) {
    erros.push({ campo: 'jogadorId', mensagem: 'O campo "jogadorId" é obrigatório e deve ser um inteiro positivo.' });
  }

  if (!ehDataValida(dados.dataTreino)) {
    erros.push({ campo: 'dataTreino', mensagem: 'O campo "dataTreino" é obrigatório no formato YYYY-MM-DD.' });
  }

  const tipo = typeof dados.tipo === 'string' ? dados.tipo.trim().toUpperCase() : dados.tipo;
  if (!TIPOS.includes(tipo)) {
    erros.push({ campo: 'tipo', mensagem: 'Tipo inválido. Use F (Físico), T (Técnico) ou E (Estratégico).' });
  }

  const duracaoMin = paraInteiro(dados.duracaoMin);
  if (Number.isNaN(duracaoMin) || duracaoMin <= 0) {
    erros.push({ campo: 'duracaoMin', mensagem: 'A duração (duracaoMin) deve ser um número inteiro maior que zero.' });
  }

  const intensidade = paraInteiro(dados.intensidade);
  if (Number.isNaN(intensidade) || intensidade < 1 || intensidade > 10) {
    erros.push({ campo: 'intensidade', mensagem: 'A intensidade deve ser um número inteiro entre 1 e 10.' });
  }

  if (erros.length > 0) {
    throw new ErroApi(400, 'Dados do treino inválidos.', erros);
  }

  return { codigo, jogadorId, dataTreino: dados.dataTreino, tipo, duracaoMin, intensidade };
}

/**
 * Registra um treino: valida os dados, verifica o jogador (existente e ativo),
 * impede código duplicado, calcula a carga e persiste a sessão.
 */
async function registrarTreino(dados) {
  const campos = validarDadosTreino(dados);

  const jogador = await Jogador.findByPk(campos.jogadorId);
  if (!jogador) {
    throw new ErroApi(404, `Jogador com id ${campos.jogadorId} não encontrado.`);
  }
  if (!jogador.ativo) {
    throw new ErroApi(400, `O jogador "${jogador.nome}" está inativo e não pode receber novos treinos.`);
  }

  const codigoExistente = await Treino.findOne({ where: { codigo: campos.codigo } });
  if (codigoExistente) {
    throw new ErroApi(409, `Já existe um treino cadastrado com o código "${campos.codigo}".`);
  }

  const carga = calcularCarga(campos.duracaoMin, campos.intensidade, campos.tipo);
  const treino = await Treino.create({ ...campos, carga });
  await treino.reload({ include: [INCLUIR_JOGADOR] });

  return {
    treino,
    calculo: descreverCalculo(campos.duracaoMin, campos.intensidade, campos.tipo)
  };
}

/**
 * Lista treinos com dados do jogador (include) e filtros dinâmicos:
 * jogadorId, tipo, dataInicio e dataFim.
 */
async function listarTreinos(filtros = {}) {
  const where = {};

  if (filtros.jogadorId !== undefined) {
    where.jogadorId = validarId(filtros.jogadorId, 'jogadorId');
  }

  if (filtros.tipo !== undefined) {
    const tipo = String(filtros.tipo).trim().toUpperCase();
    if (!TIPOS.includes(tipo)) {
      throw new ErroApi(400, 'Filtro "tipo" inválido. Use F, T ou E.');
    }
    where.tipo = tipo;
  }

  const dataInicio = filtros.dataInicio !== undefined ? validarData(filtros.dataInicio, 'dataInicio') : null;
  const dataFim = filtros.dataFim !== undefined ? validarData(filtros.dataFim, 'dataFim') : null;

  if (dataInicio && dataFim) {
    if (dataInicio > dataFim) {
      throw new ErroApi(400, 'O filtro "dataInicio" não pode ser posterior a "dataFim".');
    }
    where.dataTreino = { [Op.between]: [dataInicio, dataFim] };
  } else if (dataInicio) {
    where.dataTreino = { [Op.gte]: dataInicio };
  } else if (dataFim) {
    where.dataTreino = { [Op.lte]: dataFim };
  }

  return Treino.findAll({
    where,
    include: [INCLUIR_JOGADOR],
    order: [['dataTreino', 'ASC'], ['codigo', 'ASC']]
  });
}

/**
 * Lista os treinos de um jogador específico (verifica se o jogador existe).
 */
async function listarTreinosPorJogador(idInformado) {
  const id = validarId(idInformado);
  const jogador = await Jogador.findByPk(id);

  if (!jogador) {
    throw new ErroApi(404, `Jogador com id ${id} não encontrado.`);
  }

  return listarTreinos({ jogadorId: id });
}

/**
 * Exclui um treino pelo código único (destroy); lança 404 se não existir.
 */
async function excluirTreino(codigoInformado) {
  const codigo = String(codigoInformado || '').trim();
  const treino = await Treino.findOne({ where: { codigo } });

  if (!treino) {
    throw new ErroApi(404, `Treino com código "${codigo}" não encontrado.`);
  }

  const dadosExcluidos = treino.toJSON();
  await treino.destroy();
  return dadosExcluidos;
}

module.exports = {
  calcularCarga,
  registrarTreino,
  listarTreinos,
  listarTreinosPorJogador,
  excluirTreino
};
