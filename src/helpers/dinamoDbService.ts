import {
  DeleteItemCommand,
  DynamoDBClient,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandOutput,
  PutCommand,
  QueryCommandOutput,
  UpdateCommand,
  UpdateCommandOutput,
} from '@aws-sdk/lib-dynamodb';

import 'dotenv/config';
import { docClientLocal } from './createTables'; // TO LOCAL TEST
import {
  Key,
  NewUser,
  NewLink,
  ConditionExpression,
  DeleteItem,
} from '../types';

export const docClientAws = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const getItemFromDb = async (
  tableName: string,
  key: Key
): Promise<GetCommandOutput> => {
  const getCommand = new GetCommand({
    TableName: tableName,
    Key: key,
  });

  const result = await docClientAws.send(getCommand);
  return result;
};

export const putIntoDb = async (
  tableName: string,
  newItem: NewUser | NewLink
): Promise<void> => {
  const createCommand = new PutCommand({
    TableName: tableName,
    Item: newItem,
  });

  await docClientAws.send(createCommand);
};

export const updateDb = async (
  tableName: string,
  key: Key,
  queryObj: ConditionExpression
): Promise<UpdateCommandOutput> => {
  const { prop, value, increment } = queryObj;

  const updateExpression = increment
    ? `set ${prop} = ${prop} + :increment`
    : `set ${prop} = :${prop}`;

  const expressionAttributeValues = increment
    ? {
        ':increment': increment,
      }
    : {
        [`:${prop}`]: value,
      };

  const updateCommand = new UpdateCommand({
    TableName: tableName,
    Key: key,
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  });

  const result = await docClientAws.send(updateCommand);
  return result;
};

export const deleteFromDb = async (
  tableName: string,
  deleteItem: DeleteItem
): Promise<void> => {
  const deleteCommand = new DeleteItemCommand({
    TableName: tableName,
    Key: deleteItem,
  });

  await docClientAws.send(deleteCommand);
};

export const getItemsFromDb = async (
  tableName: string,
  indexName: string,
  queryObj: ConditionExpression
): Promise<QueryCommandOutput> => {
  const { prop, value } = queryObj;

  const getItemsCommand = new QueryCommand({
    TableName: tableName,
    IndexName: indexName,
    KeyConditionExpression: `${prop} = :${prop}`,
    ExpressionAttributeValues: {
      [`:${prop}`]: value,
    } as Record<string, any>,
  });

  const response = await docClientAws.send(getItemsCommand);
  return response;
};
