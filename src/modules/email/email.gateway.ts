import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EmailService } from './email.service';

@WebSocketGateway()
export class EmailGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;

    constructor(private readonly emailService: EmailService) { }

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
        const connection = await this.emailService.connect();
        connection.on('mail', async () => {
            const emails = await this.emailService.getEmails('inbox');
            this.server.emit('emails', emails);
        });
    }
}
