// src/infrastructure/database/models/blog-post-tag.model.ts
import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import BlogPost from './blog-post.model';
import BlogTag from './blog-tag.model';

@Table({
    tableName: 'blog_post_tags',
    timestamps: true,
    underscored: true,
})
export default class BlogPostTag extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4(),
    })
    id!: string;

    @ForeignKey(() => BlogPost)
    @Column({
        type: DataType.UUID,
        field: 'post_id',
        allowNull: false,
    })
    postId!: string;

    @ForeignKey(() => BlogTag)
    @Column({
        type: DataType.UUID,
        field: 'tag_id',
        allowNull: false,
    })
    tagId!: string;
}