// src/infrastructure/database/models/promotion.model.ts
import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import Coupon from './coupon.model';

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
        allowNull: true,
    })
    description?: string;

    @Column({
        type: DataType.ENUM('percentage', 'fixed'),
        allowNull: false,
        field: 'discount_type',
    })
    discountType!: 'percentage' | 'fixed';

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
        field: 'discount_value',
    })
    discountValue!: number;

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
        type: DataType.DECIMAL(10, 2),
        allowNull: true,
        field: 'minimum_purchase',
    })
    minimumPurchase?: number;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: true,
        field: 'maximum_discount',
    })
    maximumDiscount?: number;

    @Column({
        type: DataType.JSON,
        allowNull: true,
        field: 'applicable_products',
    })
    applicableProducts?: string[];

    @Column({
        type: DataType.JSON,
        allowNull: true,
        field: 'applicable_categories',
    })
    applicableCategories?: string[];

    @HasMany(() => Coupon)
    coupons!: Coupon[];
}