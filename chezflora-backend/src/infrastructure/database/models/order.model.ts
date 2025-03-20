// src/infrastructure/database/models/Address.ts
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { AddressEntity } from '../../../domain/entities/address.entity';
import { User } from './User';

@Table({
    tableName: 'addresses',
    timestamps: true,
})
export class Address extends Model implements AddressEntity {
    @Column({
        type: DataType.STRING,
        primaryKey: true,
        defaultValue: () => uuidv4(),
    })
    id!: string;

    @ForeignKey(() => User)
    @Column({
        type: DataType.STRING,
        field: 'user_id',
        allowNull: false,
    })
    userId!: string;

    @BelongsTo(() => User)
    user!: User;

    @Column({
        type: DataType.STRING,
        field: 'first_name',
        allowNull: false,
    })
    firstName!: string;

    @Column({
        type: DataType.STRING,
        field: 'last_name',
        allowNull: false,
    })
    lastName!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    street!: string;

    @Column({
        type: DataType.STRING,
        field: 'zip_code',
        allowNull: false,
    })
    zipCode!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    city!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    country!: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    phone?: string;

    @Column({
        type: DataType.BOOLEAN,
        field: 'is_default',
        defaultValue: false,
    })
    isDefault!: boolean;

    @Column({
        type: DataType.DATE,
        field: 'created_at',
        defaultValue: DataType.NOW,
    })
    createdAt!: Date;

    @Column({
        type: DataType.DATE,
        field: 'updated_at',
        defaultValue: DataType.NOW,
    })
    updatedAt!: Date;
}

// src/infrastructure/database/models/Category.ts
import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { CategoryEntity } from '../../../domain/entities/category.entity';
import { Product } from './Product';

@Table({
    tableName: 'categories',
    timestamps: true,
})
export class Category extends Model implements CategoryEntity {
    @Column({
        type: DataType.STRING,
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
        type: DataType.STRING,
        allowNull: true,
    })
    image?: string;

    @Column({
        type: DataType.DATE,
        field: 'created_at',
        defaultValue: DataType.NOW,
    })
    createdAt!: Date;

    @Column({
        type: DataType.DATE,
        field: 'updated_at',
        defaultValue: DataType.NOW,
    })
    updatedAt!: Date;

    @HasMany(() => Product)
    products!: Product[];
}

// src/infrastructure/database/models/Product.ts
import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, BelongsToMany } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { ProductEntity } from '../../../domain/entities/product.entity';
import { Category } from './Category';
import { ProductImage } from './ProductImage';
import { CartItem } from './CartItem';
import { OrderItem } from './OrderItem';
import { Promotion } from './Promotion';
import { ProductPromotion } from './ProductPromotion';

@Table({
    tableName: 'products',
    timestamps: true,
})
export class Product extends Model implements ProductEntity {
    @Column({
        type: DataType.STRING,
        primaryKey: true,
        defaultValue: () => uuidv4(),
    })
    id!: string;

    @ForeignKey(() => Category)
    @Column({
        type: DataType.STRING,
        field: 'category_id',
        allowNull: false,
    })
    categoryId!: string;

    @BelongsTo(() => Category)
    category!: Category;

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
        type: DataType.BOOLEAN,
        field: 'is_active',
        defaultValue: true,
    })
    isActive!: boolean;

    @Column({
        type: DataType.DATE,
        field: 'created_at',
        defaultValue: DataType.NOW,
    })
    createdAt!: Date;

    @Column({
        type: DataType.DATE,
        field: 'updated_at',
        defaultValue: DataType.NOW,
    })
    updatedAt!: Date;

    @HasMany(() => ProductImage)
    images!: ProductImage[];

    @HasMany(() => CartItem)
    cartItems!: CartItem[];

    @HasMany(() => OrderItem)
    orderItems!: OrderItem[];

    @BelongsToMany(() => Promotion, () => ProductPromotion)
    promotions!: Promotion[];
}

// src/infrastructure/database/models/ProductImage.ts
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { ProductImageEntity } from '../../../domain/entities/productImage.entity';
import { Product } from './Product';

@Table({
    tableName: 'product_images',
    timestamps: true,
})
export class ProductImage extends Model implements ProductImageEntity {
    @Column({
        type: DataType.STRING,
        primaryKey: true,
        defaultValue: () => uuidv4(),
    })
    id!: string;

    @ForeignKey(() => Product)
    @Column({
        type: DataType.STRING,
        field: 'product_id',
        allowNull: false,
    })
    productId!: string;

    @BelongsTo(() => Product)
    product!: Product;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    url!: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
    })
    order!: number;

    @Column({
        type: DataType.DATE,
        field: 'created_at',
        defaultValue: DataType.NOW,
    })
    createdAt!: Date;

    @Column({
        type: DataType.DATE,
        field: 'updated_at',
        defaultValue: DataType.NOW,
    })
    updatedAt!: Date;
}

// src/infrastructure/database/models/Cart.ts
import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { CartEntity } from '../../../domain/entities/cart.entity';
import { User } from './User';
import { CartItem } from './CartItem';

@Table({
    tableName: 'carts',
    timestamps: true,
})
export class Cart extends Model implements CartEntity {
    @Column({
        type: DataType.STRING,
        primaryKey: true,
        defaultValue: () => uuidv4(),
    })
    id!: string;

    @ForeignKey(() => User)
    @Column({
        type: DataType.STRING,
        field: 'user_id',
        allowNull: false,
    })
    userId!: string;

    @BelongsTo(() => User)
    user!: User;

    @Column({
        type: DataType.DATE,
        field: 'created_at',
        defaultValue: DataType.NOW,
    })
    createdAt!: Date;

    @Column({
        type: DataType.DATE,
        field: 'updated_at',
        defaultValue: DataType.NOW,
    })
    updatedAt!: Date;

    @HasMany(() => CartItem)
    items!: CartItem[];
}

// src/infrastructure/database/models/CartItem.ts
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { CartItemEntity } from '../../../domain/entities/cartItem.entity';
import { Cart } from './Cart';
import { Product } from './Product';

@Table({
    tableName: 'cart_items',
    timestamps: true,
})
export class CartItem extends Model implements CartItemEntity {
    @Column({
        type: DataType.STRING,
        primaryKey: true,
        defaultValue: () => uuidv4(),
    })
    id!: string;

    @ForeignKey(() => Cart)
    @Column({
        type: DataType.STRING,
        field: 'cart_id',
        allowNull: false,
    })
    cartId!: string;

    @BelongsTo(() => Cart)
    cart!: Cart;

    @ForeignKey(() => Product)
    @Column({
        type: DataType.STRING,
        field: 'product_id',
        allowNull: false,
    })
    productId!: string;

    @BelongsTo(() => Product)
    product!: Product;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 1,
    })
    quantity!: number;

    @Column({
        type: DataType.DECIMAL(10, 2),
        field: 'unit_price',
        allowNull: false,
    })
    unitPrice!: number;

    @Column({
        type: DataType.DATE,
        field: 'created_at',
        defaultValue: DataType.NOW,
    })
    createdAt!: Date;

    @Column({
        type: DataType.DATE,
        field: 'updated_at',
        defaultValue: DataType.NOW,
    })
    updatedAt!: Date;
}