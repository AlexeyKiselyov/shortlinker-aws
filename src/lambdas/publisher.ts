import 'dotenv/config';
import { DynamoDB, SQS } from 'aws-sdk';

const dynamoDB = new DynamoDB.DocumentClient();

type ProcessEnv = {
  LINKS_TABLE_NAME: string;
  QUEUE_URL: string;
  AWS_REGION: string;
};

const { LINKS_TABLE_NAME, QUEUE_URL, AWS_REGION } = process.env as ProcessEnv;

const sqs = new SQS({
  apiVersion: 'latest',
  region: AWS_REGION,
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
  const nowDate = new Date();
  const params = {
    TableName: LINKS_TABLE_NAME,
    FilterExpression: '#expireDate <= :nowDate',
    ExpressionAttributeValues: { ':nowDate': nowDate },
  };

  const result = await dynamoDB.scan(params).promise();
  return result.Items || [];
}

async function deleteLink(linkId: string): Promise<void> {
  const params = {
    TableName: LINKS_TABLE_NAME,
    Key: { id: linkId },
  };

  await dynamoDB.delete(params).promise();
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

  await sqs.sendMessageBatch(params).promise();
}
