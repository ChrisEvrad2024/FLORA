// src/infrastructure/database/models/post-tag.model.ts
import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import BlogPost from './blog-post.model';
import Tag from './tag.model';

@Table({
    tableName: 'post_tags',
    timestamps: true,
    underscored: true,
})
export default class PostTag extends Model {
    @ForeignKey(() => BlogPost)
    @Column({
        type: DataType.UUID,
        allowNull: false,
        field: 'post_id',
        primaryKey: true,
    })
    postId!: string;

    @ForeignKey(() => Tag)
    @Column({
        type: DataType.UUID,
        allowNull: false,
        field: 'tag_id',
        primaryKey: true,
    })
    tagId!: string;
}