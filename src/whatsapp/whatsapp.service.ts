// whatsapp/services/whatsapp.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { generate, setErrorLevel } from 'qrcode-terminal';
import { Repository } from 'typeorm';
import { Client } from 'whatsapp-web.js';

import { RemoteAuth } from 'src/remote-auth';
import { AwsS3Store } from '../shared/common/s3-store';
import { sendMessageDto } from './model/whatsapp.dto';
import { WhatsAppEntity } from './model/whatsapp.entity';

setErrorLevel('L');

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private activeClients = new Map<string, Client>();

  constructor(
    @InjectRepository(WhatsAppEntity)
    private readonly sessionRepository: Repository<WhatsAppEntity>,
    private readonly awsS3Store: AwsS3Store,
  ) {}

  // Session Management
  async createSession(): Promise<WhatsAppEntity> {
    const session = this.sessionRepository.create({
      status: 'initializing',
    });
    await this.sessionRepository.save(session);

    // Initialize client in background
    this.getOrCreateClient(session.id).catch((err) =>
      this.logger.error('Client initialization error:', err),
    );

    return session;
  }

  async getSession(sessionId: string): Promise<WhatsAppEntity | null> {
    return this.sessionRepository.findOne({ where: { id: sessionId } });
  }

  async updateSession(sessionId: string, updates: Partial<WhatsAppEntity>) {
    await this.sessionRepository.update({ id: sessionId }, updates);
  }

  async disconnectSession(sessionId: string): Promise<void> {
    await this.destroyClient(sessionId);
    await this.updateSession(sessionId, { status: 'disconnected' });
  }

  // Client Management
  async getOrCreateClient(sessionId: string): Promise<Client> {
    if (this.activeClients.has(sessionId)) {
      return this.activeClients.get(sessionId)!;
    }

    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    return this.initializeNewClient(sessionId);
  }

  private async initializeNewClient(sessionId: string): Promise<Client> {
    try {
      const client = new Client({
        authStrategy: new RemoteAuth({
          clientId: sessionId,
          store: this.awsS3Store,
          backupSyncIntervalMs: 300000,
        }),
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--single-process',
            '--no-zygote',
            '--disable-gpu',
            '--disable-software-rasterizer',
            '--disable-features=site-per-process,TranslateUI',
            '--disable-breakpad',
            '--disable-extensions',
            '--disable-infobars',
            '--window-size=1280,720',
          ],
        },
        takeoverOnConflict: true,
        restartOnAuthFail: true,
      });

      this.setupEventListeners(client, sessionId);

      this.activeClients.set(sessionId, client);

      await client.initialize();

      return client;
    } catch (error) {
      this.logger.error(`Client initialization failed: ${error.message}`);
      // await this.updateSession(sessionId, { status: 'failed' });
      throw error;
    }
  }

  private setupEventListeners(client: Client, sessionId: string): void {
    client.on('qr', async (qr) => {
      generate(qr, { small: true });
      await this.updateSession(sessionId, {
        status: 'awaiting_qr',
        qrCode: qr,
      });
    });

    client.on('authenticated', async (session) => {
      await this.updateSession(sessionId, {
        authData: session,
      });
    });

    client.on('ready', async () => {
      console.log('ready');
      const phoneNumber = client.info.wid.user;
      await this.updateSession(sessionId, {
        status: 'ready',
        phoneNumber,
        qrCode: null,
      });
    });

    client.on('disconnected', async () => {
      console.log('disconnected');
      await this.updateSession(sessionId, {
        status: 'disconnected',
      });
      this.activeClients.delete(sessionId);
    });

    client.on('auth_failure', async () => {
      await this.updateSession(sessionId, {
        status: 'auth_failed',
      });
    });
    client.on('remote_session_saved', async () => {
      console.log('sesion saved');
      await this.updateSession(sessionId, {
        status: 'session_saved',
      });
    });
  }

  async getClient(sessionId: string): Promise<Client> {
    // Get existing client if available
    let client = this.activeClients.get(sessionId);

    if (!client) {
      // Initialize new client if none exists
      client = await this.initializeNewClient(sessionId);
    }

    // Wait for ready state if not already ready
    if (!client.info || !client.pupPage || client.pupPage.isClosed()) {
      await this.waitForReady(client, sessionId);
    }

    return client;
  }

  private waitForReady(client: Client, sessionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Timeout after 30 seconds
      const timeout = setTimeout(() => {
        reject(new Error(`Session ${sessionId} not ready after 30 seconds`));
      }, 30000);

      // Success handler
      const readyHandler = () => {
        clearTimeout(timeout);
        client.removeListener('disconnected', disconnectHandler);
        resolve();
      };

      // Error handler
      const disconnectHandler = () => {
        clearTimeout(timeout);
        client.removeListener('ready', readyHandler);
        reject(new Error(`Session ${sessionId} disconnected while waiting`));
      };

      // Set up event listeners
      client.once('ready', readyHandler);
      client.once('disconnected', disconnectHandler);

      // Check if already ready
      if (client.info && client.pupPage && !client.pupPage.isClosed()) {
        readyHandler();
      }
    });
  }
  // Messaging
  async sendMessage(data: sendMessageDto): Promise<any> {
    try {
      const client = await this.getClient(data.sessionId);

      const whatsAppNumber = `${data.to}@c.us`;
      if (!client.pupPage || !client.info) {
        throw new Error('WhatsApp client not properly initialized');
      }

      console.log(
        'Sending message to:',
        data.sessionId,
        whatsAppNumber,
        data.content,
      );

      const msg = await client.sendMessage(whatsAppNumber, data.content);
      return msg;
    } catch (error) {
      console.log(error);
    }
  }

  async destroyClient(sessionId: string): Promise<void> {
    const client = this.activeClients.get(sessionId);
    if (client) {
      await client.destroy();
      this.activeClients.delete(sessionId);
    }
  }
}
