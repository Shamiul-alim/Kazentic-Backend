import { Controller, Get, Param } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('emails')
export class EmailController {
  constructor(private readonly emailService: EmailService) { }

  @Get(':folder')
  async getEmails(@Param('folder') folder: string) {
    try {
      const emails = await this.emailService.getEmails(folder);
      return { success: true, emails };
    } catch (error) {
      console.error('Error fetching emails:', error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      return { success: false, message };
    }
  }
}
