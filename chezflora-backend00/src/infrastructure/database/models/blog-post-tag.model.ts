// blog-post-tag.model.ts
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import BlogPost from './blog-post.model';
import BlogTag from './blog-tag.model';

@Table({
    tableName: 'blog_post_tags',
    modelName: 'BlogPostTag',
    underscored: true,
    timestamps: true
})
export default class BlogPostTag extends Model {
    @Column({
        type: DataType.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true
    })
    public id!: string;

    @ForeignKey(() => BlogPost)
    @Column({
        type: DataType.UUID,
        allowNull: false,
        field: 'post_id'
    })
    public postId!: string;

    @BelongsTo(() => BlogPost)
    public post!: BlogPost;

    @ForeignKey(() => BlogTag)
    @Column({
        type: DataType.UUID,
        allowNull: false,
        field: 'tag_id'
    })
    public tagId!: string;

    @BelongsTo(() => BlogTag)
    public tag!: BlogTag;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}