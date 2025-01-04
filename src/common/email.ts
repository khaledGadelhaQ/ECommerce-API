import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter;

  constructor(private readonly configService: ConfigService) {
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';

    // Configure the transporter based on the environment
    this.transporter = isProduction
      ? this.createProductionTransporter()
      : this.createDevelopmentTransporter();
  }

  private createDevelopmentTransporter() {
    return nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });
  }

  private createProductionTransporter() {
    // TODO: Add production email configuration here (e.g., AWS SES, SendGrid, etc.)
    throw new Error('Production email transporter is not configured.');
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
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error(`Failed to send email: ${error.message}`);
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
