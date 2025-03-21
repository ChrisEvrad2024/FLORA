'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('blog_posts', 'scheduled_publish_date', {
            type: Sequelize.DATE,
            allowNull: true,
            after: 'publish_date'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('blog_posts', 'scheduled_publish_date');
    }
};