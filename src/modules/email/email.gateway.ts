import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EmailService } from './email.service';
import { OnModuleInit } from '@nestjs/common';


@WebSocketGateway({ cors: true })
export class EmailGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
    @WebSocketServer()
    server!: Server;

    constructor(private readonly emailService: EmailService) { }


    private lastInboxId: number = 0;
    private lastSentId: number = 0;

    async onModuleInit() {
        await this.initializeLastIds();
        await this.setupInboxListener();
        await this.setupSentListener();
    }

    private async setupInboxListener() {
        const conn = await this.emailService.connectListener('INBOX');
        conn.on('mail', () => this.checkNewInbox());
        conn.on('update', () => this.checkNewInbox());
    }

    private async setupSentListener() {
        const conn = await this.emailService.connectListener('[Gmail]/Sent Mail');
        conn.on('mail', () => this.checkNewSent());
        conn.on('update', () => this.checkNewSent());
    }

    private async initializeLastIds() {
        const inbox = await this.emailService.getEmails('INBOX', 1);
        if (inbox.length > 0) this.lastInboxId = inbox[0].uid;

        const sent = await this.emailService.getEmails('[Gmail]/Sent Mail', 1);
        if (sent.length > 0) this.lastSentId = sent[0].uid;

        console.log(`Initialized IDs - Inbox: ${this.lastInboxId}, Sent: ${this.lastSentId}`);
    }

    @SubscribeMessage('join_folder')
    handleJoinFolder(client: Socket, folder: string) {
        client.rooms.forEach(room => { if (room !== client.id) client.leave(room); });
        client.join(folder);
        console.log(`Client ${client.id} joined room: ${folder}`);
    }
    async handleConnection(client: Socket) {

        const inbox = await this.emailService.getEmails('INBOX', 1);
        if (inbox.length > 0) this.lastInboxId = Math.max(this.lastInboxId, inbox[0].uid);

        const sent = await this.emailService.getEmails('[Gmail]/Sent Mail', 1);
        if (sent.length > 0) this.lastSentId = Math.max(this.lastSentId, sent[0].uid);
    }

    async handleDisconnect(client: Socket) { }


    async listenForUpdates() {
        const connection = await this.emailService.connectListener();

        connection.on('mail', async () => {
            await this.checkNewInbox();
        });
        connection.on('update', async () => {
            await this.checkNewInbox();
            await this.checkNewSent();
        });
    }
    private async checkNewInbox() {
        const latest = await this.emailService.getEmails('INBOX', 5);
        const newEmails = latest.filter(e => e.uid > this.lastInboxId);

        if (newEmails.length > 0) {
            this.lastInboxId = Math.max(...newEmails.map(e => e.uid));
            console.log(`New Inbox mail found. ID: ${this.lastInboxId}`);
            this.server.to('inbox').emit('new_emails', newEmails);
        }
    }

    private async checkNewSent() {
        try {
            const latestSent = await this.emailService.getEmails('[Gmail]/Sent Mail', 5);
            const newSent = latestSent.filter(e => e.uid > this.lastSentId);

            if (newSent.length > 0) {
                this.lastSentId = Math.max(...newSent.map(e => e.uid));
                console.log(`New Sent mail found. ID: ${this.lastSentId}`);
                this.server.to('sent').emit('new_emails', newSent);
            }
        } catch (error) {
            console.error("Error checking new sent emails:", error);
        }
    }
}
