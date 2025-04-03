import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: configService.get('MAIL_HOST'),
      port: configService.get('MAIL_PORT'),
      secure: configService.get('MAIL_SECURE'),
      auth: {
        user: configService.get('MAIL_USER'),
        pass: configService.get('MAIL_PASSWORD'),
      },
    });
  }

  async sendInvitationEmail(email: string, inviteLink: string): Promise<void> {
    const templatePath = path.join(
      __dirname,
      '../../auth/templates/invitation-email.template.html',
    );
    let html = fs.readFileSync(templatePath, 'utf8');
    html = html.replace('{{inviteLink}}', inviteLink);

    await this.transporter.sendMail({
      from: this.configService.get('MAIL_FROM'),
      to: email,
      subject: 'You have been invited to join an organization',
      html,
    });
  }
}
