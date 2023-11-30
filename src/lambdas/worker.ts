import { sendEmail } from '../helpers';
import { SQSEvent } from '../types';

export const handler = async function (event: SQSEvent): Promise<void> {
  for (const item of event.Records) {
    const { email, message } = JSON.parse(item.body);

    await sendEmail({ email, message });
  }
};
