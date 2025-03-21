// src/infrastructure/database/models/promotion.model.ts
import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import PromotionCategory from './promotion-category.model';
import PromotionProduct from './promotion-product.model';

@Table({
    tableName: 'promotions',
    timestamps: true,
    underscored: true,
})
export default class Promotion extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4(),
    })
    id!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    name!: string;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    description!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    code!: string;

    @Column({
        type: DataType.ENUM('percentage', 'fixed_amount'),
        allowNull: false,
    })
    type!: 'percentage' | 'fixed_amount';

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
    })
    value!: number;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: true,
        field: 'min_purchase_amount',
    })
    minPurchaseAmount?: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        field: 'max_uses',
    })
    maxUses?: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'uses_count',
    })
    usesCount!: number;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        field: 'start_date',
    })
    startDate!: Date;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        field: 'end_date',
    })
    endDate!: Date;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active',
    })
    isActive!: boolean;

    @Column({
        type: DataType.ENUM('all', 'categories', 'products'),
        allowNull: false,
        field: 'applies_to',
    })
    appliesTo!: 'all' | 'categories' | 'products';

    @HasMany(() => PromotionCategory)
    categories!: PromotionCategory[];

    @HasMany(() => PromotionProduct)
    products!: PromotionProduct[];
}