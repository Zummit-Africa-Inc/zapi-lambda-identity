import { Injectable } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";
import { AuthService } from "src/auth/auth.service";
import { User } from "src/entities/user.entity";

@Injectable()
export class SessionSerializer extends PassportSerializer{
    constructor(private readonly authService: AuthService,){
        super();
    }

    serializeUser(user: any, done: Function) {
        done(null,user)
    }

    async deserializeUser(payload: User, done: Function) {
      const user = await this.authService.findUser(payload.id)
      return user ? done(null,user) : done(null,null)
    }
}