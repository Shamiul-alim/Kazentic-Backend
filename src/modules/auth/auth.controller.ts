import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from "@nestjs/common";
import { AuthService } from "@/modules/auth/auth.service";
import { AuthDto } from "@/modules/auth/dto";
import { ValidationPipe } from "@/common/pipes/validation.pipe";


@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) { }

  @HttpCode(HttpStatus.OK)
  @Post("login")
  login(@Body(new ValidationPipe()) dto: AuthDto) {
    return this.authService.signIn(dto);
  }
}
