// src/infrastructure/database/models/coupon.model.ts
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import Promotion from './promotion.model';

@Table({
    tableName: 'coupons',
    timestamps: true,
    underscored: true,
})
export default class Coupon extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4(),
    })
    id!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    code!: string;

    @ForeignKey(() => Promotion)
    @Column({
        type: DataType.UUID,
        allowNull: false,
        field: 'promotion_id',
    })
    promotionId!: string;

    @BelongsTo(() => Promotion)
    promotion!: Promotion;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        field: 'usage_limit',
    })
    usageLimit?: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'usage_count',
    })
    usageCount!: number;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active',
    })
    isActive!: boolean;

    @Column({
        type: DataType.DATE,
        allowNull: true,
        field: 'expiry_date',
    })
    expiryDate?: Date;
}