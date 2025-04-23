import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity('update_notification')
@Unique(['jobId'])
export class UpdateNotification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  jobId: string;

  @Column({ nullable: true })
  new_title: string;

  @Column({ nullable: true })
  new_message: string;

  @Column()
  new_scheduleAt: Date;
}
