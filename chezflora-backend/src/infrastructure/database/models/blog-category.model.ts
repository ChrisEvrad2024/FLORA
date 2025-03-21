// src/infrastructure/database/models/blog-category.model.ts
import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import BlogPost from './blog-post.model';

@Table({
    tableName: 'blog_categories',
    timestamps: true,
    underscored: true,
})
export default class BlogCategory extends Model {
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
    name!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    slug!: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    description?: string;

    @HasMany(() => BlogPost)
    posts!: BlogPost[];
}