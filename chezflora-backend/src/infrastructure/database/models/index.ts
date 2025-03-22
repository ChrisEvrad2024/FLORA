// src/infrastructure/database/models/index.ts
import User from './user.model';
import Address from './address.model';
import Category from './category.model';
import Product from './product.model';
import ProductImage from './product-image.model';
import Cart from './cart.model';
import CartItem from './cart-item.model';
import Order from './order.model';
import OrderItem from './order-item.model';
import Quote from './quote.model';
import QuoteItem from './quote-item.model';
import BlogPost from './blog-post.model';
import BlogCategory from './blog-category.model';
import Comment from './comment.model';
import Promotion from './promotion.model';
import PromotionProduct from './promotion-product.model';
import PromotionCategory from './promotion-category.model';
import Favorite from './favorite.model';
import NewsletterSubscription from './newsletter-subscription.model';
import Invoice from './invoice.model';
import Tag from './tag.model';
import PostTag from './post-tag.model';
import ProductReview from './product-review.model';

// Export all models
export {
    User,
    Address,
    Category,
    Product,
    ProductImage,
    Cart,
    CartItem,
    Order,
    OrderItem,
    Quote,
    QuoteItem,
    BlogPost,
    BlogCategory,
    Comment,
    Promotion,
    PromotionProduct,
    PromotionCategory,
    Favorite,
    NewsletterSubscription,
    Invoice,
    Tag,
    PostTag,
    ProductReview
};

// src/infrastructure/database/config.ts part (already correct, but included for completeness)
import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import path from 'path';
import * as models from './models';

dotenv.config();

const modelsArray = Object.values(models);

export const sequelize = new Sequelize({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    database: process.env.DB_NAME || 'chezflora',
    dialect: 'mysql',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    models: modelsArray,
    logging: process.env.NODE_ENV !== 'production',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

export async function initializeDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');

        // In development, you might want to sync the database
        if (process.env.NODE_ENV === 'development') {
            const shouldForce = process.env.DB_FORCE_SYNC === 'true';
            await sequelize.sync({ force: shouldForce });
            console.log(`Database ${shouldForce ? 'force ' : ''}synchronized.`);
        }
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        throw error;
    }
}

export default sequelize;