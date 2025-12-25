import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from "@nestjs/common";
import { EmailService } from "./email.service";

@Controller("email")
export class EmailController {
  constructor(private emailService: EmailService) {}

  @Get()
  async getEmails() {
    return await this.emailService.getEmails();
  }
}
