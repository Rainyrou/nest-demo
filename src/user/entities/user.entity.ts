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
    name: 'nickname',
    length: 50,
  })
  nickname: string;

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
  iphone_number: string;

  @Column({
    name: 'is_frozen',
    default: false,
  })
  is_frozen: boolean;

  @Column({
    name: 'is_admin',
    default: false,
  })
  is_admin: boolean;

  @CreateDateColumn()
  create_time: Date;

  @UpdateDateColumn()
  update_time: Date;

  @ManyToMany(() => Role)
  @JoinTable({ name: 'user_roles' })
  roles: Role[];
}
