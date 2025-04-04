import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendInvitationEmail(
    email: string,
    inviterName: string,
    organizationName: string,
    role: string,
    invitationLink: string,
  ) {
    const templatePath = join(
      __dirname,
      '../../../templates/invitation-email.template.html',
    );
    let htmlTemplate = readFileSync(templatePath, 'utf8');

    htmlTemplate = htmlTemplate
      .replace('{{inviterName}}', inviterName)
      .replace('{{organizationName}}', organizationName)
      .replace('{{role}}', role)
      .replace('{{invitationLink}}', invitationLink);

    await this.mailerService.sendMail({
      to: email,
      subject: `Invitation to join ${organizationName}`,
      html: htmlTemplate,
    });
  }
}
