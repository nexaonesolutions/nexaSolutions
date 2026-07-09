import nodemailer from 'nodemailer';
import dns from 'dns';

// Fix ENETUNREACH errors in cloud environments (like Render) that don't support external IPv6
dns.setDefaultResultOrder('ipv4first');

// Configure the transport layer using Gmail SMTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587, // Use 587 instead of 465 to bypass Render firewall rules
  secure: false, // Must be false for 587 (STARTTLS), true for 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface EmailDetails {
  to: string;
  subject: string;
  body: string; // expects HTML content
}

/**
 * Sends a generic email (like password resets, OTPs, or confirmations)
 * @param details - The email details containing the destination, subject, and HTML body
 */
export const sendEmail = async (details: EmailDetails) => {
  // Defensive check for local environment configurations
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ EMAIL_USER or EMAIL_PASS not set in environment variables. Simulating email send:');
    console.log(`To: ${details.to}\nSubject: ${details.subject}\nBody: ${details.body}`);
    return Promise.resolve();
  }

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Nexa Solutions'}" <${process.env.EMAIL_USER}>`,
      to: details.to,
      subject: details.subject,
      html: details.body,
    });
    console.log('Email successfully sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Backwards compatible export for existing confirmation emails
 */
export const sendConfirmationEmail = sendEmail;
