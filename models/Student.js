const Sequelize = require('sequelize');
const dbInstance = require('../db/dao');

class Student extends Sequelize.Model {
    // Custom class methods here
}

Student.init({
    id: { type: Sequelize.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true, unique: true },
    name: { type: Sequelize.STRING },
    // year_level: { type: Sequelize.INTEGER },
    class: { type: Sequelize.INTEGER }
}, { sequelize: dbInstance });

module.exports = Student;