import 'dotenv/config';
import { SES } from 'aws-sdk';
import { EmailToSend, ProcessEnv } from '../types';
import { emailToSendSchema } from '../models/email';

const { SES_EMAIL_SENDER } = process.env as ProcessEnv;

const ses = new SES();

export const sendEmail = async function (emailToSend: EmailToSend) {
  await emailToSendSchema.validate(emailToSend);
  const { email, message, id } = emailToSend;

  const messageToSend = message ? message : `Your link ${id} has expired.`;

  const params: SES.SendEmailRequest = {
    Destination: { ToAddresses: [email] },
    Message: {
      Body: { Text: { Data: messageToSend } },
      Subject: { Data: 'Link Expiration Notification' },
    },
    Source: SES_EMAIL_SENDER!,
  };

  try {
    await ses.sendEmail(params).promise();
  } catch (err) {
    console.log('Error sending email:', err);
  }
};
