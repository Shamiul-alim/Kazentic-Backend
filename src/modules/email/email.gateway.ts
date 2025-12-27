import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EmailService } from './email.service';
import { OnModuleInit } from '@nestjs/common';


@WebSocketGateway({ cors: true })
export class EmailGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
    @WebSocketServer()
    server!: Server;

    constructor(private readonly emailService: EmailService) { }

    async onModuleInit() {
        console.log('Starting IMAP mail listener...');
        await this.listenForNewEmails();
    }

    async handleConnection(client: Socket) {
        console.log('Client connected: ' + client.id);
    }

    async handleDisconnect(client: Socket) {
        console.log('Client disconnected: ' + client.id);
    }

    @SubscribeMessage('getEmails')
    async handleGetEmails(client: Socket, @MessageBody() folder: string) {
        const emails = await this.emailService.getEmails(folder);
        client.emit('emails', emails);
    }


    async listenForNewEmails() {
        const connection = await this.emailService.connectListener();
        connection.on('mail', async () => {
            console.log('New email detected');
            const emails = await this.emailService.getEmails('INBOX');
            this.server.emit('emails', emails);
        });
    }
}
