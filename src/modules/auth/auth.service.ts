import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthDto } from "@/modules/auth/dto";
import * as argon from "argon2";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { User } from "@/modules/user/entities/user.entity";
import { UsersService } from "@/modules/user/user.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async signIn(dto: AuthDto) {
    const user = await this.userService.findOneBy({
      where: { email: dto.email },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const passwordMatch = await argon.verify(user.password, dto.password);
    if (!passwordMatch) {
      throw new UnauthorizedException("Incorrect credentials");
    }

    const tokens = await this.signTokens(user);

    return {
      ...tokens,
      role: user.role,
    };
  }

  private async signTokens(user: User) {
    const accessPayload = {
      user_id: user.id,
      email: user.email,
      role: user.role,
    };

    const refreshPayload = {
      user_id: user.id,
    };

    const accessToken = await this.jwt.signAsync(accessPayload, {
      secret: this.config.get("JWT_BEARER_SECRET"),
      expiresIn: "15m",
    });

    const refreshToken = await this.jwt.signAsync(refreshPayload, {
      secret: this.config.get("JWT_REFRESH_SECRET"),
      expiresIn: "1d",
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 15 * 60,
    };
  }
}
