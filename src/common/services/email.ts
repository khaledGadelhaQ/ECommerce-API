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
    const subject = 'Verify your email - Made4U';
    const html = `
      <h1>Welcome!</h1>
      <p>Please verify your email address by clicking the link below:</p>
      <p>Note: The link is valid for 10 minutes</p>
      <a href="${url}">Verify Email</a>
    `;

    await this.sendEmail({ to: user.email, subject, html });
  }

  async sendResetPasswordEmail(user: { email: string }, url: string) {
    const subject = 'Reset Your Password - Made4U';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f4f4f4; border-radius: 10px; color: #333;">
        <h1 style="text-align: center; color: #4CAF50;">Password Reset Request</h1>
        <p>Hi,</p>
        <p>We received a request to reset your password. Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${url}" style="background-color: #4CAF50; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-size: 16px;">Reset Password</a>
        </div>
        <p>If you did not request a password reset, please ignore this email or contact our support team if you have any questions.</p>
        <p>This link will expire in 10 minutes.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 12px; color: #666;">If the button above doesn't work, paste this link into your web browser:</p>
        <p style="font-size: 12px; color: #666; word-wrap: break-word;">${url}</p>
        <p style="font-size: 12px; color: #666;">Thank you for using Made4U!</p>
      </div>
    `;

    await this.sendEmail({ to: user.email, subject, html });
  }

  async sendPasswordResetConfirmation(email: string) {
    const subject = 'Your Password Has Been Changed Successfully';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f4f4f4; border-radius: 10px; color: #333;">
        <h1 style="text-align: center; color: #4CAF50;">Password Changed Successfully</h1>
        <p>Hi,</p>
        <p>Your password has been changed successfully. If you made this change, you can safely disregard this email.</p>
        <p>If you did not request this change, please contact our support team immediately to secure your account.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 20px;">
        <p style="font-size: 12px; color: #666;">Thank you for trusting Made4U!</p>
      </div>
    `;

    await this.sendEmail({ to: email, subject, html });
  }
}
