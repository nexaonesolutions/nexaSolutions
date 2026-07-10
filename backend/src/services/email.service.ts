import nodemailer from 'nodemailer';
import dns from 'dns';

// Fix ENETUNREACH errors in cloud environments (like Render) that don't support external IPv6
dns.setDefaultResultOrder('ipv4first');

// Configure the transport layer using Gmail SMTP - fully optimized for Render
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Bypasses Render's lack of IPv6 support by forcing IPv4 at the socket level
  family: 4, 
  // Prevent TLS connection issues on cloud containers
  tls: { rejectUnauthorized: false }
} as any);

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
