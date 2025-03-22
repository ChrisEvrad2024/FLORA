import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import Category from './category.model';
import ProductImage from './product-image.model';
import { CartItem, OrderItem } from '.';

@Table({
    tableName: 'products',
    timestamps: true,
    underscored: true,
})
export default class Product extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4(),
    })
    id!: string;

    @ForeignKey(() => Category)
    @Column({
        type: DataType.UUID,
        field: 'category_id',
        allowNull: false,
    })
    categoryId!: string;

    // Fix: Garder l'alias par défaut 'category' ou spécifier explicitement un alias différent
    // Si vous gardez simplement @BelongsTo(() => Category), l'alias par défaut sera 'category'
    // Option 1: Utiliser un alias explicite
    @BelongsTo(() => Category, { as: 'productCategory' })
    productCategory!: Category;

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
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
    })
    price!: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
    })
    stock!: number;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    image?: string;

    @Column({
        type: DataType.BOOLEAN,
        field: 'is_active',
        defaultValue: true,
    })
    isActive!: boolean;

    @HasMany(() => ProductImage)
    images!: ProductImage[];

    @HasMany(() => CartItem)
    cartItems!: CartItem[];

    @HasMany(() => OrderItem)
    orderItems!: OrderItem[];
}
