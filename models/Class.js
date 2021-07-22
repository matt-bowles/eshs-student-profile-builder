const Sequelize = require('sequelize');
const dbInstance = require('../db/dao');

class Class extends Sequelize.Model {
    // Custom class methods here
}

Class.init({
    id: { type: Sequelize.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true, unique: true },
    code: { type: Sequelize.STRING },
}, { sequelize: dbInstance });

module.exports = Class;