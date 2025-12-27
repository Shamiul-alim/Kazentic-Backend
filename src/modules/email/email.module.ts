import { Module } from "@nestjs/common";
import { EmailController } from "./email.controller";
import { EmailService } from "./email.service";
import { EmailGateway } from "./email.gateway";
@Module({
  imports: [],
  controllers: [EmailController],
  providers: [EmailService, EmailGateway],
  exports: [EmailService],
})
export class EmailModule { }
