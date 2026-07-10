import { Resend } from 'resend';

// Resend uses HTTPS (not SMTP) — works on any cloud platform including Render
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Ensure EMAIL_FROM is actually a valid email format before using it
const validEmailFrom = process.env.EMAIL_FROM && process.env.EMAIL_FROM.includes('@') 
  ? process.env.EMAIL_FROM 
  : 'suporte@nexasolutions.store';

const FROM_ADDRESS = `Nexa Solutions <${validEmailFrom}>`;

interface EmailDetails {
  to: string;
  subject: string;
  body: string; // HTML content
}

/**
 * Sends a transactional email via Resend HTTP API.
 * Does NOT use SMTP — works on Render, Vercel, Railway, etc.
 */
export const sendEmail = async (details: EmailDetails) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️  RESEND_API_KEY not set. Printing email to console (dev mode):');
    console.log(`To: ${details.to}\nSubject: ${details.subject}`);
    return;
  }

  if (!resend) {
    throw new Error('Serviço de e-mail não configurado no servidor (Falta RESEND_API_KEY).');
  }

  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: details.to,
    subject: details.subject,
    html: details.body,
  });

  if (error) {
    console.error('Resend error:', error);
    throw new Error(error.message);
  }

  console.log('✅ Email sent via Resend. ID:', data?.id);
  return data;
};

/**
 * Backwards compatible export for existing confirmation emails
 */
export const sendConfirmationEmail = sendEmail;
