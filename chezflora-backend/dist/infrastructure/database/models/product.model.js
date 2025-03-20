
// src/infrastructure/database/models/Product.ts
const sequelize_typescript_3 = require("sequelize-typescript");
const Category_1 = require("./Category");
Object.defineProperty(exports, "Category", { enumerable: true, get: function () { return Category_1.Category; } });
const ProductImage_1 = require("./ProductImage");
Object.defineProperty(exports, "ProductImage", { enumerable: true, get: function () { return ProductImage_1.ProductImage; } });
const CartItem_1 = require("./CartItem");
Object.defineProperty(exports, "CartItem", { enumerable: true, get: function () { return CartItem_1.CartItem; } });
const OrderItem_1 = require("./OrderItem");
const Promotion_1 = require("./Promotion");
const ProductPromotion_1 = require("./ProductPromotion");
let Product = class Product extends sequelize_typescript_1.Model {
};
exports.Product = Product;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        primaryKey: true,
        defaultValue: () => (0, uuid_1.v4)(),
    }),
    __metadata("design:type", String)
], Product_1.Product.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Category_1.Category),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        field: 'category_id',
        allowNull: false,
    }),
    __metadata("design:type", String)
], Product_1.Product.prototype, "categoryId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Category_1.Category),
    __metadata("design:type", typeof (_b = typeof Category_1.Category !== "undefined" && Category_1.Category) === "function" ? _b : Object)
], Product_1.Product.prototype, "category", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Product_1.Product.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: true,
    }),
    __metadata("design:type", String)
], Product_1.Product.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(10, 2),
        allowNull: false,
    }),
    __metadata("design:type", Number)
], Product_1.Product.prototype, "price", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
    }),
    __metadata("design:type", Number)
], Product_1.Product.prototype, "stock", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN,
        field: 'is_active',
        defaultValue: true,
    }),
    __metadata("design:type", Boolean)
], Product_1.Product.prototype, "isActive", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        field: 'created_at',
        defaultValue: sequelize_typescript_1.DataType.NOW,
    }),
    __metadata("design:type", Date)
], Product_1.Product.prototype, "createdAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        field: 'updated_at',
        defaultValue: sequelize_typescript_1.DataType.NOW,
    }),
    __metadata("design:type", Date)
], Product_1.Product.prototype, "updatedAt", void 0);
__decorate([
    (0, sequelize_typescript_2.HasMany)(() => ProductImage_1.ProductImage),
    __metadata("design:type", Array)
], Product_1.Product.prototype, "images", void 0);
__decorate([
    (0, sequelize_typescript_2.HasMany)(() => CartItem_1.CartItem),
    __metadata("design:type", Array)
], Product_1.Product.prototype, "cartItems", void 0);
__decorate([
    (0, sequelize_typescript_2.HasMany)(() => OrderItem_1.OrderItem),
    __metadata("design:type", Array)
], Product_1.Product.prototype, "orderItems", void 0);
__decorate([
    (0, sequelize_typescript_3.BelongsToMany)(() => Promotion_1.Promotion, () => ProductPromotion_1.ProductPromotion),
    __metadata("design:type", Array)
], Product_1.Product.prototype, "promotions", void 0);
exports.Product = Product_1.Product = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'products',
        timestamps: true,
    })
], Product_1.Product);
let ProductImage = class ProductImage extends sequelize_typescript_1.Model {
};
exports.ProductImage = ProductImage;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        primaryKey: true,
        defaultValue: () => (0, uuid_1.v4)(),
    }),
    __metadata("design:type", String)
], ProductImage_1.ProductImage.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Product_1.Product),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        field: 'product_id',
        allowNull: false,
    }),
    __metadata("design:type", String)
], ProductImage_1.ProductImage.prototype, "productId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Product_1.Product),
    __metadata("design:type", typeof (_c = typeof Product_1.Product !== "undefined" && Product_1.Product) === "function" ? _c : Object)
], ProductImage_1.ProductImage.prototype, "product", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], ProductImage_1.ProductImage.prototype, "url", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
    }),
    __metadata("design:type", Number)
], ProductImage_1.ProductImage.prototype, "order", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        field: 'created_at',
        defaultValue: sequelize_typescript_1.DataType.NOW,
    }),
    __metadata("design:type", Date)
], ProductImage_1.ProductImage.prototype, "createdAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        field: 'updated_at',
        defaultValue: sequelize_typescript_1.DataType.NOW,
    }),
    __metadata("design:type", Date)
], ProductImage_1.ProductImage.prototype, "updatedAt", void 0);
exports.ProductImage = ProductImage_1.ProductImage = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'product_images',
        timestamps: true,
    })
], ProductImage_1.ProductImage);
let Cart = class Cart extends sequelize_typescript_1.Model {
};
exports.Cart = Cart;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        primaryKey: true,
        defaultValue: () => (0, uuid_1.v4)(),
    }),
    __metadata("design:type", String)
], Cart_1.Cart.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => User_1.User),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        field: 'user_id',
        allowNull: false,
    }),
    __metadata("design:type", String)
], Cart_1.Cart.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => User_1.User),
    __metadata("design:type", typeof (_d = typeof User_1.User !== "undefined" && User_1.User) === "function" ? _d : Object)
], Cart_1.Cart.prototype, "user", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        field: 'created_at',
        defaultValue: sequelize_typescript_1.DataType.NOW,
    }),
    __metadata("design:type", Date)
], Cart_1.Cart.prototype, "createdAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        field: 'updated_at',
        defaultValue: sequelize_typescript_1.DataType.NOW,
    }),
    __metadata("design:type", Date)
], Cart_1.Cart.prototype, "updatedAt", void 0);
__decorate([
    (0, sequelize_typescript_2.HasMany)(() => CartItem_1.CartItem),
    __metadata("design:type", Array)
], Cart_1.Cart.prototype, "items", void 0);
exports.Cart = Cart_1.Cart = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'carts',
        timestamps: true,
    })
], Cart_1.Cart);
const Cart_1 = require("./Cart");
Object.defineProperty(exports, "Cart", { enumerable: true, get: function () { return Cart_1.Cart; } });
let CartItem = class CartItem extends sequelize_typescript_1.Model {
};
exports.CartItem = CartItem;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        primaryKey: true,
        defaultValue: () => (0, uuid_1.v4)(),
    }),
    __metadata("design:type", String)
], CartItem_1.CartItem.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Cart_1.Cart),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        field: 'cart_id',
        allowNull: false,
    }),
    __metadata("design:type", String)
], CartItem_1.CartItem.prototype, "cartId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Cart_1.Cart),
    __metadata("design:type", typeof (_e = typeof Cart_1.Cart !== "undefined" && Cart_1.Cart) === "function" ? _e : Object)
], CartItem_1.CartItem.prototype, "cart", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Product_1.Product),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        field: 'product_id',
        allowNull: false,
    }),
    __metadata("design:type", String)
], CartItem_1.CartItem.prototype, "productId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Product_1.Product),
    __metadata("design:type", typeof (_f = typeof Product_1.Product !== "undefined" && Product_1.Product) === "function" ? _f : Object)
], CartItem_1.CartItem.prototype, "product", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
        defaultValue: 1,
    }),
    __metadata("design:type", Number)
], CartItem_1.CartItem.prototype, "quantity", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DECIMAL(10, 2),
        field: 'unit_price',
        allowNull: false,
    }),
    __metadata("design:type", Number)
], CartItem_1.CartItem.prototype, "unitPrice", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        field: 'created_at',
        defaultValue: sequelize_typescript_1.DataType.NOW,
    }),
    __metadata("design:type", Date)
], CartItem_1.CartItem.prototype, "createdAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        field: 'updated_at',
        defaultValue: sequelize_typescript_1.DataType.NOW,
    }),
    __metadata("design:type", Date)
], CartItem_1.CartItem.prototype, "updatedAt", void 0);
exports.CartItem = CartItem_1.CartItem = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'cart_items',
        timestamps: true,
    })
], CartItem_1.CartItem);
