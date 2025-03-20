import { Table, Column, Model, DataType, HasMany, BeforeCreate, BeforeUpdate } from 'sequelize-typescript';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UserEntity } from '../../../domain/entities/user.entity';

@Table({
    tableName: 'users',
    timestamps: true,
})
export class User extends Model implements UserEntity {
    @Column({
        type: DataType.STRING,
        primaryKey: true,
        defaultValue: () => uuidv4(),
    })
    id!: string;

    @Column({
        type: DataType.STRING,
        field: 'first_name',
        allowNull: false,
    })
    firstName!: string;

    @Column({
        type: DataType.STRING,
        field: 'last_name',
        allowNull: false,
    })
    lastName!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    })
    email!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    password!: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    phone?: string;

    @Column({
        type: DataType.ENUM('client', 'admin', 'super_admin'),
        defaultValue: 'client',
    })
    role!: 'client' | 'admin' | 'super_admin';

    @Column({
        type: DataType.ENUM('active', 'inactive', 'banned'),
        defaultValue: 'active',
    })
    status!: 'active' | 'inactive' | 'banned';

    @Column({
        type: DataType.DATE,
        field: 'last_login',
        allowNull: true,
    })
    lastLogin?: Date;

    @Column({
        type: DataType.DATE,
        field: 'created_at',
        defaultValue: DataType.NOW,
    })
    createdAt!: Date;

    @Column({
        type: DataType.DATE,
        field: 'updated_at',
        defaultValue: DataType.NOW,
    })
    updatedAt!: Date;

    @BeforeCreate
    @BeforeUpdate
    static async hashPassword(instance: User) {
        if (instance.changed('password')) {
            const salt = await bcrypt.genSalt(10);
            instance.password = await bcrypt.hash(instance.password, salt);
        }
    }

    async comparePassword(candidatePassword: string): Promise<boolean> {
        return bcrypt.compare(candidatePassword, this.password);
    }
}