import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { SharedEntity } from '../common/model/sharedEntity';
import { User } from './user.entity';

@Entity()
export class LoginHistory extends SharedEntity {
  @Column({ nullable: true })
  login_time?: string;

  @Column('simple-json', { nullable: true })
  country?: { longitude: string; latitude: string };

  @Column({ nullable: true })
  ip_address?: string;

  @Column({ nullable: true })
  browser_name?: string;

  @Column({ nullable: true })
  os_name?: string;

  @Column({ nullable: true })
  userId?: string;

  @ManyToOne(() => User, (user) => user.loginHistories, {onDelete: 'SET NULL'})
  @JoinColumn({ name: 'userId' })
  history: LoginHistory;
}
