import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EmailService } from './email.service';
import { OnModuleInit } from '@nestjs/common';


@WebSocketGateway({ cors: true })
export class EmailGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
    @WebSocketServer()
    server!: Server;

    constructor(private readonly emailService: EmailService) { }
    private lastFetchedEmailId: number = 0;

    async onModuleInit() {
        console.log('Starting IMAP mail listener...');
        await this.listenForNewEmails();
    }

    private updateLastId(emails: any[]) {
        if (emails.length > 0) {
            const maxUid = Math.max(...emails.map(e => e.uid));
            if (maxUid > this.lastFetchedEmailId) {
                this.lastFetchedEmailId = maxUid;
            }
        }
    }
    async handleConnection(client: Socket) {
        console.log('Client connected: ' + client.id);
        const emails = await this.emailService.getEmails('INBOX', 10);
        this.updateLastId(emails);
        client.emit('emails', emails);
    }

    async handleDisconnect(client: Socket) {
        console.log('Client disconnected: ' + client.id);
    }


    async listenForNewEmails() {
        const connection = await this.emailService.connectListener();

        connection.on('mail', async (numNewMsgs: number) => {
            console.log(`IMAP EVENT: ${numNewMsgs} new messages detected.`);

            const latestEmails = await this.emailService.getEmails('INBOX', 5);

            const newEmails = latestEmails.filter(e => e.uid > this.lastFetchedEmailId);

            if (newEmails.length > 0) {
                this.updateLastId(newEmails);
                console.log(`SOCKET: Broadcasting ${newEmails.length} new emails to frontend`);
                this.server.emit('new_emails', newEmails);
            }
        });
    }
}
