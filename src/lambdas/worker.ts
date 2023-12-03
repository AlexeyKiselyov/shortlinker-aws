import { sendEmail } from '../helpers';
import { SQSEvent } from '../types';

// Receives messages from the queue and sends messages to users
export const handler = async function (event: SQSEvent): Promise<void> {
  for (const item of event.Records) {
    const { email, message } = JSON.parse(item.body);

    await sendEmail({ email, message });
  }
};
