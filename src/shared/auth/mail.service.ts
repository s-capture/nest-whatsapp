import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private mailerService: MailerService) {}

  async sendInvitationEmail(
    email: string,
    inviterName: string,
    organizationName: string,
    role: string,
    invitationLink: string,
  ) {
    try {
      this.logger.log(`Attempting to send email to: ${email}`);

      const templatePath = join(
        __dirname,
        '../../../src/templates/invitation-email.template.html',
      );

      // Verify template exists
      if (!existsSync(templatePath)) {
        throw new Error(`Email template not found at path: ${templatePath}`);
      }

      this.logger.debug(`Template path: ${templatePath} `);

      let htmlTemplate = readFileSync(templatePath, 'utf8');
      htmlTemplate = htmlTemplate
        .replace(/{{inviterName}}/g, inviterName)
        .replace(/{{organizationName}}/g, organizationName)
        .replace(/{{role}}/g, role)
        .replace(/{{invitationLink}}/g, invitationLink);

      this.logger.debug('Sending mail with options:', {
        to: email,
        subject: `Invitation to join ${organizationName}`,
        html: htmlTemplate.substring(0, 100) + '...', // Log first 100 chars
      });

      const result = await this.mailerService.sendMail({
        to: email,
        subject: `Invitation to join ${organizationName}`,
        html: htmlTemplate,
      });

      this.logger.log(
        `Email sent successfully to ${email}. Message ID: ${result.messageId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}:`, error.stack);
      throw error;
    }
  }
}
