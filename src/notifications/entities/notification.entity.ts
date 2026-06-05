import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "src/user/entities/user.entity";

export enum NotificationType {
  WELCOME = 'welcome',
  DISCOUNT = 'discount',
  ORDER = 'order',
}

@Entity('notifications')
export class Notification {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  title: string;

  @Column('text')
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.WELCOME
  })
  type: NotificationType;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @Column('bool', { default: false })
  read: boolean;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
