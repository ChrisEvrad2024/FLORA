'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // Création de la table blog_categories
        await queryInterface.createTable('blog_categories', {
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
            description: {
                type: Sequelize.TEXT,
                allowNull: true
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

        // Création de la table blog_posts
        await queryInterface.createTable('blog_posts', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4,
                allowNull: false
            },
            author_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            category_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'blog_categories',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false
            },
            slug: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            excerpt: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            featured_image: {
                type: Sequelize.STRING,
                allowNull: true
            },
            status: {
                type: Sequelize.ENUM('draft', 'published', 'archived'),
                defaultValue: 'draft'
            },
            published_at: {
                type: Sequelize.DATE,
                allowNull: true
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

        // Création de la table blog_comments
        await queryInterface.createTable('blog_comments', {
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
            user_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            status: {
                type: Sequelize.ENUM('pending', 'approved', 'rejected'),
                defaultValue: 'pending'
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

        // Création des index pour améliorer les performances
        await queryInterface.addIndex('blog_posts', ['author_id']);
        await queryInterface.addIndex('blog_posts', ['category_id']);
        await queryInterface.addIndex('blog_posts', ['status']);
        await queryInterface.addIndex('blog_posts', ['published_at']);
        await queryInterface.addIndex('blog_comments', ['post_id']);
        await queryInterface.addIndex('blog_comments', ['user_id']);
        await queryInterface.addIndex('blog_comments', ['status']);
    },

    async down(queryInterface, Sequelize) {
        // Suppression des tables dans l'ordre inverse pour respecter les contraintes de clés étrangères
        await queryInterface.dropTable('blog_comments');
        await queryInterface.dropTable('blog_posts');
        await queryInterface.dropTable('blog_categories');
    }
};