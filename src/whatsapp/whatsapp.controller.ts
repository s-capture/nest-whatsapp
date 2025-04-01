// whatsapp/controllers/whatsapp-sessions.controller.ts
import { Body, Controller, Get, Post } from '@nestjs/common';
import { sendMessageDto } from './model/whatsapp.dto';
import { WhatsappService } from './whatsapp.service';

@Controller('whatsapp/sessions')
export class WhatsappController {
  constructor(private readonly sessionService: WhatsappService) {}

  @Get()
  async createSession() {
    await this.sessionService.createSession();
    return { sucesss: true };
  }

  @Post('message')
  async sendmessage(@Body() data: sendMessageDto) {
    await this.sessionService.sendMessage(data);
    return { sucesss: true };
  }
}
