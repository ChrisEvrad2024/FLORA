// 20250322000000-fix-foreign-key-constraints.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Désactiver temporairement les vérifications de clés étrangères
      await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
      
      // Liste des contraintes potentiellement problématiques
      const constraintsToCheck = [
        { table: 'categories', constraint: 'categories_ibfk_1' },
        { table: 'products', constraint: 'products_category_id_fkey' },
        // Ajoutez d'autres contraintes ici si nécessaire
      ];
      
      // Vérifier et supprimer chaque contrainte si elle existe
      for (const { table, constraint } of constraintsToCheck) {
        try {
          const [checkResults] = await queryInterface.sequelize.query(`
            SELECT CONSTRAINT_NAME 
            FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
            WHERE TABLE_NAME = '${table}' 
            AND CONSTRAINT_NAME = '${constraint}'
            AND TABLE_SCHEMA = 'chezflora'
          `);
          
          if (checkResults.length > 0) {
            await queryInterface.sequelize.query(`
              ALTER TABLE ${table} DROP FOREIGN KEY ${constraint}
            `);
            console.log(`Dropped constraint ${constraint} from table ${table}`);
          }
        } catch (error) {
          console.log(`Error checking/dropping constraint ${constraint}: ${error.message}`);
        }
      }
      
      // Réactiver les vérifications de clés étrangères
      await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error fixing constraints:', error);
      return Promise.reject(error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('Nothing to revert in fix-foreign-key-constraints migration');
    return Promise.resolve();
  }
};