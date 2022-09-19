import { BeforeInsert, OneToMany, Entity, Column } from 'typeorm';
import { Exclude } from 'class-transformer';
import { randomBytes, pbkdf2Sync } from 'crypto';
import { SharedEntity } from '../common/model/sharedEntity';
import { LoginHistory } from './loginHistory.entity';

@Entity()
export class User extends SharedEntity {
  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column()
  password: string;

  @Column({ nullable: true })
  profileID?: string;

  @Column({ unique: true, nullable: true })
  @Exclude()
  refreshToken?: string;

  @OneToMany(() => LoginHistory, (loginHistory) => loginHistory.history, {onDelete: 'SET NULL'})
  loginHistories: LoginHistory[];

  @Column({unique: true, nullable: true})
  @Exclude()
  userOTP?: string

  @BeforeInsert()
  public setPassword() {
    let salt = randomBytes(32).toString('hex');
    let hash = pbkdf2Sync(this.password, salt, 1000, 64, 'sha512').toString(
      'hex',
    );
    let hashedPassword = `${salt}:${hash}`;
    this.password = hashedPassword;
    return this.password;
  }
}
