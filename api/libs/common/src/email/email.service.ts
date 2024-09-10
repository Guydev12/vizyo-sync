import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  constructor(private configService:ConfigService){}
  
  async sendVerificationEmail(email: string, token: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>("USER_EMAIL"),
        pass: this.configService.get<string>('MAIL_PASSWORD'),
      },
    });

    const mailOptions = {
  from: `"Watchly" <${this.configService.get<string>("USER_EMAIL")}>`,
  to: email,
  subject: 'Email Verification',
  html: `
    <p>Please verify your email by clicking the following link:</p>
    <a href="${this.configService.get("BASE_URL")}/auth/verify-email?token=${token}">Verify your email</a>
  `,

};

await transporter.sendMail(mailOptions);
  }
  
  
  
  async sendPasswordResetEmail(email: string, resetCode: string) {
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>("USER_EMAIL"),
        pass: this.configService.get<string>('MAIL_PASSWORD'),
      },
    });
    
  const mailOptions = {
    from:  `"Watchly" <${this.configService.get<string>("USER_EMAIL")}>`,
    to: email,
    subject: 'Password Reset',
    html: `
      <p>Your password reset code is:</p>
      <h2>${resetCode}</h2>
      <p>Please use this code to reset your password.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}
}

