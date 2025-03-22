// sync-db.js
const path = require('path');
require('dotenv').config();

// Utiliser un import direct du fichier source, pas du dist
const sequelize = require('./src/infrastructure/config/database').sequelize;

async function syncDatabase() {
    try {
        console.log('Synchronizing database models...');
        // Force: true va supprimer et recréer toutes les tables
        await sequelize.sync({ force: true });
        console.log('Database synchronized successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error synchronizing database:', error);
        console.error(error.stack);
        process.exit(1);
    }
}

syncDatabase();