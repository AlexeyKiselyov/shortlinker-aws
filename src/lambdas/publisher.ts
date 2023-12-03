import 'dotenv/config';
import { SQSClient, SendMessageBatchCommand } from '@aws-sdk/client-sqs';

import { deleteFromDb, scanExpiredLinksInDb } from '../helpers/dinamoDbService';
import { ProcessEnv } from '../types';

const { LINKS_TABLE_NAME, QUEUE_URL, REGION_AWS_FOR_SQS } =
  process.env as ProcessEnv;

const sqs = new SQSClient({
  region: REGION_AWS_FOR_SQS,
});

// Searches for expired links in the database.  If they exist, they are deleted and send delete notification messages in SQS
export const handler = async (): Promise<void> => {
  try {
    const expiredLinks = await scanExpiredLinksInDb(LINKS_TABLE_NAME!);
    if (expiredLinks.length === 0) return;
    const batchMessages: any[] = [];

    for (const link of expiredLinks) {
      await deleteFromDb(LINKS_TABLE_NAME!, { id: link.id });

      batchMessages.push({
        Id: link.id.S,
        MessageBody: JSON.stringify({
          email: link.ownerEmail.S,
          message: `Your link ${link.id.S} has expired.`,
        }),
      });

      if (batchMessages.length === 10) {
        await sendBatchNotifications(batchMessages);
        batchMessages.length = 0;
      }
    }

    if (batchMessages.length > 0) {
      await sendBatchNotifications(batchMessages);
    }
  } catch (err) {
    console.error('Queuing error:', err.message);
  }
};

async function sendBatchNotifications(messages: any[]): Promise<void> {
  try {
    const params = {
      QueueUrl: QUEUE_URL,
      Entries: messages,
    };

    const command = new SendMessageBatchCommand(params);
    await sqs.send(command);
  } catch (err) {
    throw err;
  }
}
