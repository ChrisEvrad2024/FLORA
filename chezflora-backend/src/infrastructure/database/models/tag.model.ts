// src/infrastructure/database/models/tag.model.ts
import { Table, Column, Model, DataType, BelongsToMany } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import BlogPost from './blog-post.model';
import PostTag from './post-tag.model';

@Table({
    tableName: 'tags',
    timestamps: true,
    underscored: true,
})
export default class Tag extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4(),
    })
    id!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    name!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    slug!: string;

    @BelongsToMany(() => BlogPost, () => PostTag)
    posts!: BlogPost[];
}