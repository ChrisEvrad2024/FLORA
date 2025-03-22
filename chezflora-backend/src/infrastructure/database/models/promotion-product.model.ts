import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import Promotion from './promotion.model';
import Product from './product.model';

@Table({
    tableName: 'promotion_products',
    timestamps: true,
    underscored: true,
})
export default class PromotionProduct extends Model {
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

    @ForeignKey(() => Product)
    @Column({
        type: DataType.UUID,
        allowNull: false,
        field: 'product_id',
    })
    productId!: string;

    // Fix: Use a unique alias like 'productItem' or just 'product' (default)
    @BelongsTo(() => Product)
    product!: Product;
}