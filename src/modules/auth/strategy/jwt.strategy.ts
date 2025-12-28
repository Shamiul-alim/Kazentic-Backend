import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { BearerToken } from "@/modules/auth/interfaces";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_BEARER_SECRET'),
    });
  }

  async validate(payload: BearerToken) {
    return { userId: payload.user_id, email: payload.email, role: payload.role };
  }
}
