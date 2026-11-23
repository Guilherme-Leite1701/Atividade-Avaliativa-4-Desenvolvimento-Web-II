/**
 * Service de Relatórios: consolidação semanal de carga e risco de sobrecarga.
 * Usa include, where com Op.between, group e funções de agregação do Sequelize.
 */
const { Op, fn, col } = require('sequelize');
const { Treino, Jogador } = require('../models');
const ErroApi = require('../utils/ErroApi');
const { obterConfiguracaoVigente } = require('./configuracaoService');
const { calcularSemana, arredondar, DESCRICAO_TIPOS, DESCRICAO_POSICOES } = require('./cargaService');
const { ehDataValida } = require('../utils/validacoes');

const STATUS_RISCO = 'RISCO DE SOBRECARGA';
const STATUS_NORMAL = 'NORMAL';
const CRITERIO = 'Apenas jogadores com pelo menos 1 treino na semana entram nos rankings ' +
  '(desempenho, maior carga, menor carga e jogadores em risco). ' +
  'O risco é sinalizado somente quando a carga semanal é estritamente maior que o limite configurado.';

/**
 * Agrega carga semanal (SUM) e quantidade de treinos (COUNT) por jogador.
 */
async function agregarPorJogador(where) {
  const linhas = await Treino.findAll({
    attributes: [
      'jogadorId',
      [fn('SUM', col('Treino.carga')), 'cargaSemanal'],
      [fn('COUNT', col('Treino.id')), 'quantidadeTreinos']
    ],
    where,
    include: [{ model: Jogador, attributes: ['id', 'nome', 'posicao', 'ativo'], required: true }],
    group: ['Treino.jogadorId', 'Jogador.id', 'Jogador.nome', 'Jogador.posicao', 'Jogador.ativo'],
    raw: true,
    nest: true
  });

  return linhas.map((linha) => ({
    jogadorId: linha.jogadorId,
    nome: linha.Jogador.nome,
    posicao: linha.Jogador.posicao,
    ativo: Boolean(linha.Jogador.ativo),
    cargaSemanal: arredondar(linha.cargaSemanal),
    quantidadeTreinos: Number(linha.quantidadeTreinos)
  }));
}

/**
 * Agrega carga média (AVG) e quantidade de sessões (COUNT) por tipo de treino.
 */
async function agregarPorTipo(where) {
  const linhas = await Treino.findAll({
    attributes: [
      'tipo',
      [fn('COUNT', col('id')), 'quantidadeSessoes'],
      [fn('AVG', col('carga')), 'cargaMedia']
    ],
    where,
    group: ['tipo'],
    raw: true
  });

  const resultado = {};
  for (const tipo of Object.keys(DESCRICAO_TIPOS)) {
    const linha = linhas.find((l) => l.tipo === tipo);
    resultado[tipo] = {
      descricao: DESCRICAO_TIPOS[tipo],
      quantidadeSessoes: linha ? Number(linha.quantidadeSessoes) : 0,
      cargaMedia: linha ? arredondar(linha.cargaMedia) : 0
    };
  }
  return resultado;
}

/**
 * Agrega total de treinos (COUNT) e carga média por sessão (AVG) por posição do jogador.
 */
async function agregarPorPosicao(where) {
  const linhas = await Treino.findAll({
    attributes: [
      [col('Jogador.posicao'), 'posicao'],
      [fn('COUNT', col('Treino.id')), 'totalTreinos'],
      [fn('AVG', col('Treino.carga')), 'cargaMediaPorSessao']
    ],
    where,
    include: [{ model: Jogador, attributes: [], required: true }],
    group: ['Jogador.posicao'],
    raw: true
  });

  const resultado = {};
  for (const posicao of Object.keys(DESCRICAO_POSICOES)) {
    const linha = linhas.find((l) => l.posicao === posicao);
    resultado[posicao] = {
      descricao: DESCRICAO_POSICOES[posicao],
      totalTreinos: linha ? Number(linha.totalTreinos) : 0,
      cargaMediaPorSessao: linha ? arredondar(linha.cargaMediaPorSessao) : 0
    };
  }
  return resultado;
}

/**
 * Seleciona o(s) jogador(es) com a carga extrema (maior ou menor), tratando empates.
 */
function selecionarExtremo(desempenho, tipo) {
  if (desempenho.length === 0) {
    return { empate: false, cargaSemanal: 0, jogadores: [] };
  }

  const cargas = desempenho.map((j) => j.cargaSemanal);
  const alvo = tipo === 'maior' ? Math.max(...cargas) : Math.min(...cargas);
  const jogadores = desempenho
    .filter((j) => j.cargaSemanal === alvo)
    .map(({ nome, posicao, cargaSemanal, quantidadeTreinos }) => ({ nome, posicao, cargaSemanal, quantidadeTreinos }));

  return {
    empate: jogadores.length > 1,
    observacao: jogadores.length > 1
      ? `Empate entre ${jogadores.length} jogadores com ${alvo} pontos.`
      : undefined,
    cargaSemanal: alvo,
    jogadores
  };
}

/**
 * Gera o relatório semanal de performance para a semana que contém a data de referência.
 */
async function gerarRelatorioSemanal(dataReferencia) {
  if (!ehDataValida(dataReferencia)) {
    throw new ErroApi(400, 'Informe o parâmetro "data" no formato YYYY-MM-DD. Ex.: /relatorios/semanal?data=2026-11-05');
  }

  const semana = calcularSemana(dataReferencia);
  const where = { dataTreino: { [Op.between]: [semana.inicio, semana.fim] } };

  const configuracao = await obterConfiguracaoVigente();
  const limite = configuracao ? Number(configuracao.cargaMaximaSemanal) : null;

  const [totalTreinos, somaCarga] = await Promise.all([
    Treino.count({ where }),
    Treino.sum('carga', { where })
  ]);

  const cabecalho = {
    semana: {
      dataReferencia,
      inicio: semana.inicioCompleto,
      fim: semana.fimCompleto
    },
    criterio: CRITERIO,
    limiteCargaSemanal: limite,
    ...(limite === null
      ? { avisoConfiguracao: 'Nenhum limite semanal configurado. Cadastre-o em PUT /configuracao para avaliar riscos.' }
      : {})
  };

  if (totalTreinos === 0) {
    return {
      ...cabecalho,
      semanaVazia: true,
      mensagem: 'Nenhum treino registrado nesta semana.',
      totalTreinos: 0,
      cargaTotalSemana: 0,
      desempenhoPorJogador: [],
      maiorCargaSemanal: selecionarExtremo([], 'maior'),
      menorCargaSemanal: selecionarExtremo([], 'menor'),
      jogadoresEmRisco: { quantidade: 0, jogadores: [] },
      mediaCargaPorTipo: await agregarPorTipo(where),
      resumoPorPosicao: await agregarPorPosicao(where)
    };
  }

  const [porJogador, mediaCargaPorTipo, resumoPorPosicao] = await Promise.all([
    agregarPorJogador(where),
    agregarPorTipo(where),
    agregarPorPosicao(where)
  ]);

  const desempenhoPorJogador = porJogador
    .map((jogador) => {
      const emRisco = limite !== null && jogador.cargaSemanal > limite;
      return { ...jogador, emRisco, status: emRisco ? STATUS_RISCO : STATUS_NORMAL };
    })
    .sort((a, b) => b.cargaSemanal - a.cargaSemanal || a.nome.localeCompare(b.nome));

  const emRisco = desempenhoPorJogador
    .filter((j) => j.emRisco)
    .map(({ nome, posicao, cargaSemanal, quantidadeTreinos }) => ({
      nome,
      posicao,
      cargaSemanal,
      quantidadeTreinos,
      excessoSobreLimite: arredondar(cargaSemanal - limite)
    }));

  return {
    ...cabecalho,
    semanaVazia: false,
    totalTreinos,
    cargaTotalSemana: arredondar(somaCarga || 0),
    desempenhoPorJogador,
    maiorCargaSemanal: selecionarExtremo(desempenhoPorJogador, 'maior'),
    menorCargaSemanal: selecionarExtremo(desempenhoPorJogador, 'menor'),
    jogadoresEmRisco: { quantidade: emRisco.length, jogadores: emRisco },
    mediaCargaPorTipo,
    resumoPorPosicao
  };
}

module.exports = { gerarRelatorioSemanal };
