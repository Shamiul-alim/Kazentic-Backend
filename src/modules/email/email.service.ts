import { Injectable } from '@nestjs/common';
import * as Imap from 'node-imap';
import { simpleParser } from 'mailparser';

@Injectable()
export class EmailService {
  private readonly imapConfig = {
    user: 'samiulalim01234@gmail.com',
    password: 'vnsh lino mwes ahqc', // Your Gmail App Password
    host: 'imap.gmail.com',
    port: 993,
    tls: true,  // Use TLS for secure connection
  };

  private connection: any;

  public async connect() {
    if (!this.connection) {
      console.log('Connecting to IMAP server...');
      try {
        this.connection = new Imap(this.imapConfig);
        this.connection.connect();  // Connect to IMAP server
        console.log('Connected to IMAP server');
      } catch (error) {
        console.error('Error connecting to IMAP server:', error);
        throw new Error('IMAP connection failed');
      }
    }
    return this.connection;
  }

  // Updated getEmails method
  async getEmails(folder: string) {
    const connection = await this.connect();


    return new Promise<any[]>((resolve, reject) => {
      connection.openBox(folder, false, (err: any, box: any) => {
        if (err) {
          console.error('Error opening folder:', err);
          reject('Unable to open folder');
        }

        const messages: any[] = [];
        connection.search(['ALL'], (err: any, results: any) => {
          if (err) {
            console.error('Error searching messages:', err);
            reject('Unable to search messages');
          }

          const fetch = connection.fetch(results, {
            bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'],
            struct: true,
          });

          fetch.on('message', (msg: any) => {
            const email: any = {};
            msg.on('body', (stream: any) => {
              simpleParser(stream).then((parsed: any) => {
                email['from'] = parsed.from.text;
                email['subject'] = parsed.subject;
                email['date'] = parsed.date;
                email['text'] = parsed.text;
                messages.push(email);
              }).catch((error: any) => {
                console.error('Error parsing email:', error);
              });
            });
          });

          fetch.once('end', () => {
            console.log('Fetched messages:', messages);
            resolve(messages);  // Resolve the promise with the fetched emails
          });
        });
      });
    });
  }

  // Listen for new emails
  async listenForNewEmails() {
    const connection = await this.connect();
    connection.on('mail', async () => {
      console.log('New email received');
      const emails = await this.getEmails('inbox');
      // Do something with the new emails
      console.log(emails);  // Just logging emails here for now
    });
  }
}
