import { BeforeInsert, OneToMany, Entity, Column } from 'typeorm';
import { Exclude } from 'class-transformer';
import { randomBytes, pbkdf2Sync } from 'crypto';
import { SharedEntity } from '../common/model/sharedEntity';
import { LoginHistory } from './loginHistory.entity';
import { ProviderName, SignUpType } from '../common/enum';

@Entity()
export class User extends SharedEntity {
  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ type: 'enum', enum: SignUpType, default: SignUpType.PASSWORD })
  signUpType: SignUpType;

  @Column({ nullable: true })
  password?: string;

  @Column({ type: 'enum', enum: ProviderName, default: ProviderName.GOOGLE })
  providerName?: ProviderName;

  @Column({ nullable: true })
  profileID?: string;

  @Column({ unique: true, nullable: true })
  @Exclude()
  refreshToken?: string;

  @OneToMany(() => LoginHistory, (loginHistory) => loginHistory.history, {
    onDelete: 'CASCADE',
  })
  loginHistories: LoginHistory[];

  @Column({ unique: true, nullable: true })
  @Exclude()
  userOTP?: string;

  @BeforeInsert()
  public setPassword() {
    if (this.password) {
      let salt = randomBytes(32).toString('hex');
      let hash = pbkdf2Sync(this.password, salt, 1000, 64, 'sha512').toString(
        'hex',
      );
      let hashedPassword = `${salt}:${hash}`;
      this.password = hashedPassword;
      return this.password;
    }
    return null;
  }
}
