import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transporter, createTransport } from 'nodemailer';

@Injectable()
export class EmailService {
  transporter: Transporter;
  constructor(private configService: ConfigService) {
    this.transporter = createTransport({
      host: this.configService.get('nodemailer_host'),
      port: this.configService.get('nodemailer_port'),
      secure: false, // true for 465
      auth: {
        user: this.configService.get('nodemailer_auth_user'),
        pass: this.configService.get('nodemailer_auth_pass'),
      },
    });
  }

  async sendMail({ to, subject, html }) {
    if (!to) throw new Error('No recipients defined');
    try {
      const info = await this.transporter.sendMail({
        from: {
          name: 'clown-nest',
          address: this.configService.get('nodemailer_auth_user'),
        },
        to,
        subject,
        html,
      });
      console.log('Message sent: %s', info.messageId);
    } catch (error) {
      console.error('Error occurred while sending mail:', error);
      throw error;
    }
  }
}
