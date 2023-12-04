import 'dotenv/config';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
const client = new SESClient();

import { EmailToSend, ProcessEnv } from '../types';
import { emailToSendSchema } from '../models/email';
import { validateService } from './validateService';

const { SES_EMAIL_SENDER } = process.env as ProcessEnv;

// Sends a message to the user that its link has been expired
export const sendEmail = async function (emailToSend: EmailToSend) {
  await validateService(emailToSendSchema, emailToSend);
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
    console.log(`Error sending email to "${email}":`, err);
  }
};
