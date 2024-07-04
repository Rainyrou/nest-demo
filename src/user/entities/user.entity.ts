import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Role } from './role.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 50,
  })
  username: string;

  @Column({
    length: 50,
  })
  password: string;

  @Column({
    name: 'nick_name',
    length: 50,
  })
  nickName: string;

  @Column({
    length: 50,
  })
  email: string;

  @Column({
    nullable: true,
    length: 100,
  })
  avatar: string;

  @Column({
    name: 'iphone_number',
    nullable: true,
    length: 20,
  })
  iphoneNumber: string;

  @Column({
    name: 'is_frozen',
    default: false,
  })
  isFrozen: boolean;

  @Column({
    name: 'is_admin',
    default: false,
  })
  isAdmin: boolean;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;

  @ManyToMany(() => Role)
  @JoinTable({ name: 'user_roles' })
  roles: Role[];
}
