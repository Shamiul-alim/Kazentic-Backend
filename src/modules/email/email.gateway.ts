import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EmailService } from './email.service';

@WebSocketGateway({ cors: true })
export class EmailGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;

    private lastUids: Record<string, number> = {};
    private readonly folderMap: Record<string, string> = {
        inbox: 'INBOX',
        sent: '[Gmail]/Sent Mail',
        all: '[Gmail]/All Mail',
        spam: '[Gmail]/Spam',
        trash: '[Gmail]/Trash',
        drafts: '[Gmail]/Drafts',
        starred: '[Gmail]/Starred',
    };


    constructor(private readonly emailService: EmailService) { }



    private async checkForUpdates(roomName: string, imapFolder: string) {
        try {
            const latest = await this.emailService.getEmails(imapFolder, 5);
            const currentLastId = this.lastUids[roomName] || 0;
            const newEmails = latest.filter(e => e.uid > currentLastId);

            if (newEmails.length > 0) {
                this.lastUids[roomName] = Math.max(...newEmails.map(e => e.uid));
                console.log(`New emails detected in ${roomName}. Notifying clients...`);
                this.server.to(roomName).emit('new_emails', newEmails);
            }
        } catch (error) {
            console.error(`Check update failed for ${roomName}:`, error);
        }
    }


    @SubscribeMessage('join_folder')
    async handleJoinFolder(client: Socket, folder: string) {
        const roomName = folder.toLowerCase();
        const imapFolder = this.folderMap[roomName];

        if (!imapFolder) return;

        client.rooms.forEach(r => { if (r !== client.id) client.leave(r); });
        client.join(roomName);
        console.log(`Client ${client.id} joined room: ${roomName}`);

        try {
            const isFirstTime = !this.lastUids[roomName];
            const conn = await this.emailService.connectListener(imapFolder);

            if (isFirstTime) {
                const initial = await this.emailService.getEmails(imapFolder, 1);

                this.lastUids[roomName] = initial.length > 0 ? initial[0].uid : 0;

                const checkUpdate = () => this.checkForUpdates(roomName, imapFolder);
                conn.on('mail', checkUpdate);
                conn.on('update', checkUpdate);
            }
        } catch (err) {
            console.error(`Lazy setup failed for ${roomName}:`, err);
        }
    }

    async handleConnection(client: Socket) {
        console.log(`Socket connected: ${client.id}`);
    }

    async handleDisconnect(client: Socket) { }

}
