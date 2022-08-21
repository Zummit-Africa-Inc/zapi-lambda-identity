import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { pbkdf2Sync, randomBytes } from "crypto";
import { User } from "src/entities/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class jwtHelperService {
    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>
    ){}


    async hashPassword(password: string, salt?: string) {
        if(!salt) {
            let salt = randomBytes(32).toString('hex');
            let hash = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
            let hashPassword = `${salt}: ${hash}`;
            return hashPassword;
        }
    }
}