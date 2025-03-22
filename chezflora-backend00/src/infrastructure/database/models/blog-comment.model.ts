// src/infrastructure/database/models/blog-comment.model.ts
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import User from './user.model';
import BlogPost from './blog-post.model';

@Table({
    tableName: 'blog_comments',
    timestamps: true,
    underscored: true,
})
export default class BlogComment extends Model {
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

    @BelongsTo(() => BlogPost)
    post!: BlogPost;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        field: 'user_id',
        allowNull: false,
    })
    userId!: string;

    @BelongsTo(() => User)
    user!: User;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    content!: string;

    @Column({
        type: DataType.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'approved',
    })
    status!: string;
}