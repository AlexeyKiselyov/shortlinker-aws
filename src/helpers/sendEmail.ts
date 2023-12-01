import 'dotenv/config';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
const client = new SESClient();

import { EmailToSend, ProcessEnv } from '../types';
import { emailToSendSchema } from '../models/email';

const { SES_EMAIL_SENDER } = process.env as ProcessEnv;

export const sendEmail = async function (emailToSend: EmailToSend) {
  await emailToSendSchema.validate(emailToSend);
  const { email, message, id } = emailToSend;

  const messageToSend = message ? message : `Your link ${id} has expired.`;

  const input = {
    Destination: { ToAddresses: [email] },
    Message: {
      Body: { Text: { Data: messageToSend } },
      Subject: {
        Data: 'From Shortlinker Service - Link Expiration Notification',
      },
    },
    Source: SES_EMAIL_SENDER!,
  };

  try {
    const command = new SendEmailCommand(input);
    await client.send(command);
  } catch (err) {
    console.log('Error sending email:', err);
  }
};
