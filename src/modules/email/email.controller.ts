import { Controller, Get, Param, Query } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('emails')
export class EmailController {
  constructor(private readonly emailService: EmailService) { }

  @Get(':folder')
  async getEmails(@Param('folder') folder: string, @Query('lastFetchedEmailId') lastFetchedEmailId: string,) {
    const folderMap: Record<string, string> = {
      inbox: 'INBOX',
      sent: '[Gmail]/Sent Mail',
      spam: '[Gmail]/Spam',
      trash: '[Gmail]/Trash',
      drafts: '[Gmail]/Drafts',
      all: '[Gmail]/All Mail',
      starred: '[Gmail]/Starred',
    };

    const imapFolder = folderMap[folder.toLowerCase()];

    if (!imapFolder) {
      return {
        success: false,
        message: 'Invalid folder name',
      };
    }

    try {
      const emails = await this.emailService.getEmails(imapFolder, 10,);
      return { success: true, emails };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

}
