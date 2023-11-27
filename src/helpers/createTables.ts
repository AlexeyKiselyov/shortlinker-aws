import { DynamoDBClient, CreateTableCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// db local setup
const usersTableName = 'UsersTable';
const linksTableName = 'LinksTable';
const client = new DynamoDBClient({
  region: 'localhost',
  endpoint: 'http://localhost:8000',
});

export const docClientLocal = DynamoDBDocumentClient.from(client);
export const docClientAws = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const createUserTable = async () => {
  const command = new CreateTableCommand({
    TableName: usersTableName,
    AttributeDefinitions: [
      {
        AttributeName: 'email',
        AttributeType: 'S',
      },
    ],
    KeySchema: [
      {
        AttributeName: 'email',
        KeyType: 'HASH',
      },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1,
    },
  });

  const response = await client.send(command);
  console.log(response);
};

export const createLinkTable = async () => {
  const command = new CreateTableCommand({
    TableName: linksTableName,
    AttributeDefinitions: [
      {
        AttributeName: 'id',
        AttributeType: 'S',
      },
      {
        AttributeName: 'ownerId',
        AttributeType: 'S',
      },
    ],
    KeySchema: [
      {
        AttributeName: 'id',
        KeyType: 'HASH',
      },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1,
    },
    GlobalSecondaryIndexes: [
      {
        IndexName: 'ownerIdGSI',
        KeySchema: [{ AttributeName: 'ownerId', KeyType: 'HASH' }],
        Projection: {
          ProjectionType: 'ALL',
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        },
      },
    ],
  });

  const response = await client.send(command);
  console.log(response);
};
