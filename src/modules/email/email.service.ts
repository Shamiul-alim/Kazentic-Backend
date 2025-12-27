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

  private listenerConnection: any;
  private fetchConnection: any;

  async connectListener() {
    if (!this.listenerConnection) {
      this.listenerConnection = new Imap(this.imapConfig);

      this.listenerConnection.once('ready', () => {
        console.log('IMAP listener ready');
        this.listenerConnection.openBox('INBOX', false, (err: any) => {
          if (err) console.error(err);
        });
      });

      this.listenerConnection.connect();
    }

    return this.listenerConnection;
  }
  async connectFetcher() {
    if (!this.fetchConnection) {
      this.fetchConnection = new Imap(this.imapConfig);
      this.fetchConnection.connect();
    }
    return this.fetchConnection;
  }



  // Updated getEmails method
  async getEmails(folder: string) {
    const connection = await this.connectFetcher();



    return new Promise<any[]>((resolve, reject) => {
      connection.openBox(folder, false, (err: any, box: any) => {
        if (err) {
          console.error('Error opening folder:', err);
          reject('Unable to open folder');
        }

        const messages: any[] = [];
        const searchCriteria =
          folder === '[Gmail]/Drafts'
            ? ['DRAFT']
            : folder === '[Gmail]/Starred'
              ? ['FLAGGED']
              : ['ALL'];

        connection.search(searchCriteria, (err: any, results: any) => {
          if (err) return reject(err);
          if (!results || results.length === 0) {
            console.log(`No emails found in ${folder}`);
            return resolve([]);
          }

          const fetch = connection.fetch(results, {
            bodies: '',
            struct: true,
          });

          fetch.on('message', (msg: any) => {
            msg.on('body', (stream: any) => {
              simpleParser(stream)
                .then((parsed: { from: { text: any; }; subject: any; date: any; text: any; }) => {
                  messages.push({
                    from: parsed.from?.text ?? '(Draft)',
                    subject: parsed.subject ?? '(No Subject)',
                    date: parsed.date ?? null,
                    text: parsed.text ?? '',
                    isDraft: folder === '[Gmail]/Drafts',
                  });
                })
                .catch(console.error);
            });
          });

          fetch.once('end', () => resolve(messages));
        });
      });
    });
  }

}
