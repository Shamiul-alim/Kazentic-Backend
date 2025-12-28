import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EmailService } from './email.service';
import { OnModuleInit } from '@nestjs/common';


@WebSocketGateway({ cors: true })
export class EmailGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
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



    async onModuleInit() {
        console.log('Initializing Real-time Listeners for all folders...');

        // Initialize listeners for every folder in the map
        for (const [roomName, imapFolder] of Object.entries(this.folderMap)) {
            try {
                // 1. Get initial UID for this folder
                const initial = await this.emailService.getEmails(imapFolder, 1);
                this.lastUids[roomName] = initial.length > 0 ? initial[0].uid : 0;

                // 2. Setup long-lived listener
                const conn = await this.emailService.connectListener(imapFolder);

                // 3. Attach events
                const checkUpdate = () => this.checkForUpdates(roomName, imapFolder);
                conn.on('mail', checkUpdate);
                conn.on('update', checkUpdate);

                console.log(`✓ Listener ready for: ${roomName}`);
            } catch (err) {
                console.error(`Error setting up ${roomName}:`, err);
            }
        }
    }
    private async checkForUpdates(roomName: string, imapFolder: string) {
        try {
            const latest = await this.emailService.getEmails(imapFolder, 5);
            const currentLastId = this.lastUids[roomName] || 0;
            const newEmails = latest.filter(e => e.uid > currentLastId);

            if (newEmails.length > 0) {
                this.lastUids[roomName] = Math.max(...newEmails.map(e => e.uid));
                console.log(`New emails detected in ${roomName}. Notifying clients...`);
                // Send only to the specific room (e.g. 'all', 'inbox', 'sent')
                this.server.to(roomName).emit('new_emails', newEmails);
            }
        } catch (error) {
            console.error(`Check update failed for ${roomName}:`, error);
        }
    }


    @SubscribeMessage('join_folder')
    handleJoinFolder(client: Socket, folder: string) {
        const room = folder.toLowerCase();
        // Leave other folder rooms, but stay in the personal client.id room
        client.rooms.forEach(r => { if (r !== client.id) client.leave(r); });

        if (this.folderMap[room]) {
            client.join(room);
            console.log(`Client ${client.id} switched to room: ${room}`);
        }
    }

    async handleConnection(client: Socket) {
        console.log(`Socket connected: ${client.id}`);
    }

    async handleDisconnect(client: Socket) { }

}
