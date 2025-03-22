// src/infrastructure/database/models/promotion-category.model.ts
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import Promotion from './promotion.model';
import Category from './category.model';

@Table({
    tableName: 'promotion_categories',
    timestamps: true,
    underscored: true,
})
export default class PromotionCategory extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4(),
    })
    id!: string;

    @ForeignKey(() => Promotion)
    @Column({
        type: DataType.UUID,
        allowNull: false,
        field: 'promotion_id',
    })
    promotionId!: string;

    @BelongsTo(() => Promotion)
    promotion!: Promotion;

    @ForeignKey(() => Category)
    @Column({
        type: DataType.UUID,
        allowNull: false,
        field: 'category_id',
    })
    categoryId!: string;

    // Fix: Utilisez un alias explicite et unique
    @BelongsTo(() => Category, { as: 'promotionCategory' })
    promotionCategory!: Category;
}