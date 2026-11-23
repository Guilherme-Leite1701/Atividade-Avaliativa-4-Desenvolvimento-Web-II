/**
 * Model Jogador: atleta do clube.
 * Posições: G = Goleiro, Z = Zagueiro, M = Meio-campo, A = Atacante.
 */
module.exports = (sequelize, DataTypes) => {
  const Jogador = sequelize.define('Jogador', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING(120),
      allowNull: false,
      validate: {
        notNull: { msg: 'O campo "nome" é obrigatório.' },
        notEmpty: { msg: 'O campo "nome" não pode ser vazio.' }
      }
    },
    posicao: {
      type: DataTypes.ENUM('G', 'Z', 'M', 'A'),
      allowNull: false,
      validate: {
        notNull: { msg: 'O campo "posicao" é obrigatório.' },
        isIn: { args: [['G', 'Z', 'M', 'A']], msg: 'Posição inválida. Use G, Z, M ou A.' }
      }
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'jogadores'
  });

  return Jogador;
};
