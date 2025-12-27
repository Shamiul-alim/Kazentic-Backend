import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as ImapNamespace from 'node-imap';
const Imap = require('node-imap');
import { simpleParser } from 'mailparser';

type ImapInstance = any;

@Injectable()
export class EmailService implements OnModuleDestroy {
  private readonly imapConfig = {
    user: process.env.user || '',
    password: process.env.password || '',
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
    authTimeout: 10000,
  };

  private listenerConnection: ImapInstance | null = null;

  onModuleDestroy() {
    if (this.listenerConnection) this.listenerConnection.end();
  }

  async connectFetcher(): Promise<ImapInstance> {

    const conn = new Imap(this.imapConfig);
    return new Promise((resolve, reject) => {
      conn.once('ready', () => resolve(conn));
      conn.once('error', (err: any) => reject(err));
      conn.connect();
    });
  }

  async getEmails(folder: string, limit: number = 10, lastUid?: number): Promise<any[]> {
    const connection = await this.connectFetcher();

    return new Promise<any[]>((resolve, reject) => {
      connection.openBox(folder, true, (err: any, box: any) => {
        if (err) {
          connection.end();
          return reject(err);
        }


        connection.search(['ALL'], (err: any, uids: number[]) => {
          if (err) {
            connection.end();
            return reject(err);
          }


          const targetUids = uids.sort((a, b) => b - a).slice(0, limit);

          if (targetUids.length === 0) {
            connection.end();
            return resolve([]);
          }

          const messagePromises: Promise<any>[] = [];

          const f = connection.fetch(targetUids, { bodies: '' });

          f.on('message', (msg: any) => {
            const p = new Promise((res) => {
              let attributes: any;
              let fullParsed: any;

              const attemptResolve = () => {
                if (attributes && fullParsed) {
                  res({
                    uid: attributes.uid,
                    from: fullParsed.from?.text ?? '(No Sender)',
                    subject: fullParsed.subject ?? '(No Subject)',
                    date: fullParsed.date,
                    textSnippet: fullParsed.text?.substring(0, 200) ?? '',
                    isDraft: folder.includes('Drafts'),
                  });
                }
              };

              msg.on('attributes', (attrs: any) => {
                attributes = attrs;
                attemptResolve();
              });

              msg.on('body', (stream: any) => {
                simpleParser(stream).then((parsed: any) => {
                  fullParsed = parsed;
                  attemptResolve();
                });
              });
            });
            messagePromises.push(p);
          });

          f.once('error', (err: any) => {
            connection.end();
            reject(err);
          });

          f.once('end', async () => {
            connection.end();
            const results = await Promise.all(messagePromises);

            resolve(results.sort((a, b) => b.uid - a.uid));
          });
        });
      });
    });
  }

  async connectListener(): Promise<ImapInstance> {
    if (!this.listenerConnection) {
      this.listenerConnection = new Imap(this.imapConfig);
      return new Promise((resolve, reject) => {
        this.listenerConnection!.once('ready', () => {
          this.listenerConnection!.openBox('INBOX', false, (err: any) => {
            if (err) return reject(err);
            console.log('IMAP listener ready and watching INBOX');
            resolve(this.listenerConnection!);
          });
        });
        this.listenerConnection!.once('error', (err: any) => reject(err));
        this.listenerConnection!.connect();
      });
    }
    return this.listenerConnection;
  }
}