// src/infrastructure/database/models/comment.model.ts
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import User from './user.model';
import BlogPost from './blog-post.model';

@Table({
    tableName: 'comments',
    timestamps: true,
    underscored: true,
})
export default class Comment extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4(),
    })
    id!: string;

    @ForeignKey(() => BlogPost)
    @Column({
        type: DataType.UUID,
        allowNull: false,
        field: 'post_id',
    })
    postId!: string;

    @BelongsTo(() => BlogPost)
    post!: BlogPost;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
        field: 'user_id',
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
        allowNull: false,
    })
    status!: 'pending' | 'approved' | 'rejected';
}