import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
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
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @Exclude()
  @CreateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
