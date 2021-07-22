const Sequelize = require('sequelize');
module.exports = new Sequelize({
    dialect: 'sqlite',
    storage: './eshs-student-profile-builder.db',
    // logging: false,
    define: {
        timestamps: false
    },
    
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }
});