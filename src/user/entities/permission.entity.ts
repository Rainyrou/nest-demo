import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({
  name: 'permissions',
})
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 20,
  })
  code: string;

  @Column({
    length: 100,
  })
  description: string;
}
