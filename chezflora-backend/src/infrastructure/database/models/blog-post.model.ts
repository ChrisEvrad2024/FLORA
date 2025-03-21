// src/infrastructure/database/models/blog-post.model.ts
import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, BelongsToMany } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import User from './user.model';
import BlogCategory from './blog-category.model';
import Comment from './comment.model';
import Tag from './tag.model';
import PostTag from './post-tag.model';

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

    @ForeignKey(() => BlogCategory)
    @Column({
        type: DataType.UUID,
        allowNull: false,
        field: 'category_id',
    })
    categoryId!: string;

    @BelongsTo(() => BlogCategory)
    category!: BlogCategory;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
        field: 'user_id',
    })
    userId!: string;

    @BelongsTo(() => User)
    author!: User;

    @Column({
        type: DataType.ENUM('draft', 'published', 'archived'),
        defaultValue: 'draft',
        allowNull: false,
    })
    status!: 'draft' | 'published' | 'archived';

    @Column({
        type: DataType.DATE,
        allowNull: true,
        field: 'publish_date',
    })
    publishDate?: Date;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        field: 'featured_image',
    })
    featuredImage?: string;

    @Column({
        type: DataType.INTEGER,
        defaultValue: 0,
        allowNull: false,
    })
    views!: number;

    @HasMany(() => Comment)
    comments!: Comment[];

    @BelongsToMany(() => Tag, () => PostTag)
    tags!: Tag[];

    @Column({
        type: DataType.DATE,
        allowNull: true,
        field: 'scheduled_publish_date',
    })
    scheduledPublishDate?: Date;

    @BelongsTo(() => User, 'userId')
    user?: User;
}