import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, body: string) {
  return await resend.emails.send({
    from: 'Vijay Patel <vjayptl12@gmail.com>',
    to,
    subject,
    html: body.replace(/\n/g, '<br/>'),
  });
}
