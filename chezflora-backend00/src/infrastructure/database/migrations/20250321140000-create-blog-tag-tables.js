'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // Create blog_tags table
        await queryInterface.createTable('blog_tags', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4,
                allowNull: false
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            slug: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });

        // Create blog_post_tags junction table
        await queryInterface.createTable('blog_post_tags', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4,
                allowNull: false
            },
            post_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'blog_posts',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            tag_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'blog_tags',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });

        // Add composite unique constraint to prevent duplicate tag-post relationships
        await queryInterface.addIndex('blog_post_tags', ['post_id', 'tag_id'], {
            unique: true,
            name: 'blog_post_tags_post_id_tag_id_unique'
        });

        // Add indexes for better performance
        await queryInterface.addIndex('blog_tags', ['slug']);
        await queryInterface.addIndex('blog_post_tags', ['post_id']);
        await queryInterface.addIndex('blog_post_tags', ['tag_id']);
    },

    async down(queryInterface, Sequelize) {
        // Drop tables in reverse order to respect foreign keys
        await queryInterface.dropTable('blog_post_tags');
        await queryInterface.dropTable('blog_tags');
    }
};