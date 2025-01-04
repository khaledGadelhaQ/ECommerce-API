import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });
  }

  async sendEmail({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }) {
    const from = this.configService.get<string>('EMAIL_FROM');

    const mailOptions = {
      from,
      to,
      subject,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      throw new Error('Could not send email.');
    }
  }

  async sendVerificationEmail(user: { email: string }, url: string) {
    const subject = 'Verify your email';
    const html = `
      <h1>Welcome!</h1>
      <p>Please verify your email address by clicking the link below:</p>
      <p>Note: The link is valid for 10 minutes</p>
      <a href="${url}">Verify Email</a>
    `;

    await this.sendEmail({ to: user.email, subject, html });
  }
}
