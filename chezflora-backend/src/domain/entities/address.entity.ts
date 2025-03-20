// src/domain/entities/address.entity.ts
export interface AddressEntity {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    street: string;
    zipCode: string;
    city: string;
    country: string;
    phone?: string;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// src/domain/entities/category.entity.ts
export interface CategoryEntity {
    id: string;
    name: string;
    description?: string;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
}

// src/domain/entities/product.entity.ts
export interface ProductEntity {
    id: string;
    categoryId: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// src/domain/entities/productImage.entity.ts
export interface ProductImageEntity {
    id: string;
    productId: string;
    url: string;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

// src/domain/entities/cart.entity.ts
export interface CartEntity {
    id: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

// src/domain/entities/cartItem.entity.ts
export interface CartItemEntity {
    id: string;
    cartId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    createdAt: Date;
    updatedAt: Date;
}

// src/domain/entities/order.entity.ts
export interface OrderEntity {
    id: string;
    userId: string;
    status: 'pending' | 'processing' | 'shipping' | 'delivered' | 'cancelled' | 'returned';
    totalAmount: number;
    shippingAddressId: string;
    paymentMethod: string;
    createdAt: Date;
    updatedAt: Date;
}

// src/domain/entities/orderItem.entity.ts
export interface OrderItemEntity {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    createdAt: Date;
    updatedAt: Date;
}

// src/domain/entities/quote.entity.ts
export interface QuoteEntity {
    id: string;
    userId: string;
    status: 'requested' | 'processing' | 'sent' | 'accepted' | 'rejected' | 'expired';
    description: string;
    eventType: string;
    eventDate: Date;
    validUntil: Date;
    budget?: number;
    customerComment?: string;
    adminComment?: string;
    createdAt: Date;
    updatedAt: Date;
}

// src/domain/entities/quoteItem.entity.ts
export interface QuoteItemEntity {
    id: string;
    quoteId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    createdAt: Date;
    updatedAt: Date;
}

// src/domain/entities/service.entity.ts
export interface ServiceEntity {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    isAvailable: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// src/domain/entities/serviceImage.entity.ts
export interface ServiceImageEntity {
    id: string;
    serviceId: string;
    url: string;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

// src/domain/entities/blog.entity.ts
export interface BlogEntity {
    id: string;
    authorId: string;
    title: string;
    content: string;
    publishDate?: Date;
    category: string;
    status: 'draft' | 'pending' | 'published' | 'rejected' | 'archived';
    createdAt: Date;
    updatedAt: Date;
}

// src/domain/entities/comment.entity.ts
export interface CommentEntity {
    id: string;
    blogId: string;
    userId: string;
    content: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
}

// src/domain/entities/promotion.entity.ts
export interface PromotionEntity {
    id: string;
    name: string;
    description: string;
    discount: number;
    startDate: Date;
    endDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

// src/domain/entities/productPromotion.entity.ts
export interface ProductPromotionEntity {
    promotionId: string;
    productId: string;
    createdAt: Date;
    updatedAt: Date;
}