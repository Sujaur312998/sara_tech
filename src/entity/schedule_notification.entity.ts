import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('schedule_notification')
export class ScheduleNotification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  jobId: string;

  @Column({ nullable: true })
  userId: number | null;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: User;
}
