import { Column, Entity, ManyToOne } from 'typeorm';
import { SharedEntity } from '../common/model/sharedEntity';
import { User } from './user.entity';

@Entity()
export class UserHistory extends SharedEntity {
  @Column({ nullable: true })
  login_time?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ nullable: true })
  ip_address?: string;

  @Column({ nullable: true })
  browser_name?: string;

  @Column({ nullable: true })
  os_name?: string;

  @ManyToOne(() => User, (user) => user.histories)
  history: User;
}
