// In a real app, you would use a library like Nodemailer and configure it with your SMTP credentials from .env
// import nodemailer from 'nodemailer';

/*
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
*/

interface EmailDetails {
  to: string;
  subject: string;
  body: string;
}

/**
 * Sends a payment confirmation email.
 * This is a STUB function.
 * @param details - The email details.
 */
export const sendConfirmationEmail = async (details: EmailDetails) => {
  console.log('--- FAKE EMAIL SENDER ---');
  console.log(`Sending email to: ${details.to}`);
  console.log(`Subject: ${details.subject}`);
  console.log('Body:');
  console.log(details.body);
  console.log('-------------------------');

  // In a real app, you would do this:
  /*
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: details.to,
      subject: details.subject,
      html: details.body,
    });
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
  */

  // Return a promise to simulate async behavior
  return Promise.resolve();
};
