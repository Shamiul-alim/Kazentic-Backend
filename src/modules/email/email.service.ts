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

  private listenerConnection: Map<string, ImapInstance> = new Map();
  private fetcherConn: ImapInstance | null = null;

  onModuleDestroy() {
    this.listenerConnection.forEach((conn) => conn.end());
    this.listenerConnection.clear();
  }

  async getFetcherConnection(): Promise<ImapInstance> {
    if (this.fetcherConn && this.fetcherConn.state !== 'disconnected') {
      return this.fetcherConn;
    }

    const conn = new Imap(this.imapConfig);
    this.fetcherConn = await new Promise((resolve, reject) => {
      conn.once('ready', () => resolve(conn));
      conn.once('error', reject);
      conn.connect();
    });
    return this.fetcherConn;
  }

  async getEmails(folder: string, limit: number = 10): Promise<any[]> {
    const connection = await this.getFetcherConnection();

    return new Promise((resolve, reject) => {
      connection.openBox(folder, true, (err: any) => {
        if (err) {
          return reject(err);
        }

        connection.search(['ALL'], (err: any, uids: number[]) => {
          if (err) {
            return reject(err);
          }

          const targetUids = uids.sort((a, b) => b - a).slice(0, limit);

          if (targetUids.length === 0) {
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
                    isDraft: folder.toLowerCase().includes('drafts'),
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

          f.once('end', async () => {
            const results = await Promise.all(messagePromises);
            resolve(results.sort((a, b) => b.uid - a.uid));
          });
        });
      });
    });
  }

  async connectListener(folder: string = 'INBOX'): Promise<ImapInstance> {
    if (this.listenerConnection.has(folder)) {
      return this.listenerConnection.get(folder);
    }

    const conn = new Imap(this.imapConfig);

    return new Promise((resolve, reject) => {
      conn.once('ready', () => {
        conn.openBox(folder, false, (err: any) => {
          if (err) {
            conn.end();
            return reject(err);
          }
          console.log(`IMAP listener watching folder: ${folder}`);
          this.listenerConnection.set(folder, conn);
          resolve(conn);
        });
      });

      conn.once('error', (err: any) => {
        console.error(`IMAP listener error for ${folder}:`, err);
        this.listenerConnection.delete(folder);
        reject(err);
      });

      conn.once('end', () => {
        console.warn(`IMAP listener connection closed for ${folder}`);
        this.listenerConnection.delete(folder);
      });

      conn.connect();
    });
  }
}