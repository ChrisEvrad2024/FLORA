// src/infrastructure/database/models/blog-post.model.ts
import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import User from './user.model';
import BlogCategory from './blog-category.model';
import BlogComment from './blog-comment.model';

@Table({
    tableName: 'blog_posts',
    timestamps: true,
    underscored: true,
})
export default class BlogPost extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4(),
    })
    id!: string;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        field: 'author_id',
        allowNull: false,
    })
    authorId!: string;

    @BelongsTo(() => User)
    author!: User;

    @ForeignKey(() => BlogCategory)
    @Column({
        type: DataType.UUID,
        field: 'category_id',
        allowNull: false,
    })
    categoryId!: string;

    @BelongsTo(() => BlogCategory)
    category!: BlogCategory;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    title!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    slug!: string;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    content!: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    excerpt?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    featuredImage?: string;

    @Column({
        type: DataType.ENUM('draft', 'published', 'archived'),
        defaultValue: 'draft',
    })
    status!: string;

    @Column({
        type: DataType.DATE,
        field: 'published_at',
        allowNull: true,
    })
    publishedAt?: Date;

    @HasMany(() => BlogComment)
    comments!: BlogComment[];
}