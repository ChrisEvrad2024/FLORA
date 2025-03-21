'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Create promotions table
        await queryInterface.createTable('promotions', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
                allowNull: false
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            code: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            type: {
                type: Sequelize.ENUM('percentage', 'fixed_amount'),
                allowNull: false
            },
            value: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            min_purchase_amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true
            },
            max_uses: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            uses_count: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            start_date: {
                type: Sequelize.DATE,
                allowNull: false
            },
            end_date: {
                type: Sequelize.DATE,
                allowNull: false
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            applies_to: {
                type: Sequelize.ENUM('all', 'categories', 'products'),
                allowNull: false
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Create promotion_categories table
        await queryInterface.createTable('promotion_categories', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
                allowNull: false
            },
            promotion_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'promotions',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            category_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'categories',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Create promotion_products table
        await queryInterface.createTable('promotion_products', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
                allowNull: false
            },
            promotion_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'promotions',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            product_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'products',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Add indexes for better performance
        await queryInterface.addIndex('promotions', ['code']);
        await queryInterface.addIndex('promotions', ['is_active']);
        await queryInterface.addIndex('promotions', ['start_date', 'end_date']);
        await queryInterface.addIndex('promotion_categories', ['promotion_id']);
        await queryInterface.addIndex('promotion_categories', ['category_id']);
        await queryInterface.addIndex('promotion_products', ['promotion_id']);
        await queryInterface.addIndex('promotion_products', ['product_id']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('promotion_products');
        await queryInterface.dropTable('promotion_categories');
        await queryInterface.dropTable('promotions');
    }
};