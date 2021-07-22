const Sequelize = require('sequelize');
const dbInstance = require('../db/dao');

class Trait extends Sequelize.Model {
    // Custom class methods here
}

Trait.init({
    id: { type: Sequelize.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true, unique: true },
    name: { type: Sequelize.STRING },
    category: { type: Sequelize.STRING }
}, { sequelize: dbInstance });

module.exports = Trait;