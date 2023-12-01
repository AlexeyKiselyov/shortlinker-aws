import 'dotenv/config';
import {
  DynamoDBClient,
  ScanCommand,
  DeleteItemCommand,
} from '@aws-sdk/client-dynamodb';

import { SQSClient, SendMessageBatchCommand } from '@aws-sdk/client-sqs';

const dynamoDB = new DynamoDBClient();

type ProcessEnv = {
  LINKS_TABLE_NAME: string;
  QUEUE_URL: string;
  REGION_AWS_FOR_SQS: string;
};

const { LINKS_TABLE_NAME, QUEUE_URL, REGION_AWS_FOR_SQS } =
  process.env as ProcessEnv;

const sqs = new SQSClient({
  region: REGION_AWS_FOR_SQS,
});

export const handler = async (): Promise<void> => {
  const expiredLinks = await getExpiredLinks();
  if (expiredLinks.length === 0) return;

  const batchMessages: any[] = [];

  for (const link of expiredLinks) {
    await deleteLink(link.id);

    batchMessages.push({
      email: link.ownerEmail,
      message: `Your link ${link.id} has expired.`,
    });

    if (batchMessages.length === 10) {
      await sendBatchNotifications(batchMessages);
      batchMessages.length = 0;
    }
  }

  if (batchMessages.length > 0) {
    await sendBatchNotifications(batchMessages);
  }
};

async function getExpiredLinks(): Promise<any[]> {
  const nowDate = new Date().toISOString();
  const params = {
    TableName: LINKS_TABLE_NAME,
    FilterExpression: 'expireDate <= :nowDate',
    ExpressionAttributeValues: { ':nowDate': { S: nowDate } },
  };

  const command = new ScanCommand(params);
  const result = await dynamoDB.send(command);
  return result.Items || [];
}

async function deleteLink(linkId: string): Promise<void> {
  const params = {
    TableName: LINKS_TABLE_NAME,
    Key: { id: { S: linkId } },
  };

  const command = new DeleteItemCommand(params);
  await dynamoDB.send(command);
}

async function sendBatchNotifications(messages: any[]): Promise<void> {
  const entries = messages.map((message, index) => ({
    Id: index.toString(),
    MessageBody: JSON.stringify(message),
  }));

  const params = {
    Entries: entries,
    QueueUrl: QUEUE_URL,
  };

  const command = new SendMessageBatchCommand(params);
  await sqs.send(command);
}
