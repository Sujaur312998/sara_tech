import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  deviceToken: string;

  @Exclude()
  @Column()
  createdAt: Date;

  @Exclude()
  @Column()
  updatedAt: Date;
}
