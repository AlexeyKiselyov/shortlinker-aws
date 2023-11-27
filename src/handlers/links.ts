import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DeleteItemCommand } from '@aws-sdk/client-dynamodb';
import { PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

import { createLinkSchema, getLinkSchema } from '../models/link';

import {
  handleError,
  HttpError,
  generateShortUrl,
  createLinkTable,
  docClient,
} from '../helpers';

import { authenticate } from '../middlewares/authenticate';

const tableName = 'LinksTable';

// create short link and save in db
export const createLink = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    await createLinkTable();

    const decodedToken = authenticate(event);
    if (!decodedToken) {
      throw HttpError(401);
    }
    const userId = decodedToken?.id!;

    const reqBody = JSON.parse(event.body as string);

    await createLinkSchema.validate(reqBody);

    const { originUrl, duration } = reqBody;

    const shortUrl = generateShortUrl(originUrl, userId);

    const newLink = {
      id: shortUrl,
      originUrl,
      duration,
      visit: 0,
      ownerId: userId,
    };

    const createLinkCommand = new PutCommand({
      TableName: tableName,
      Item: newLink,
    });

    await docClient.send(createLinkCommand);

    return {
      statusCode: 201,
      body: JSON.stringify(newLink),
    };
  } catch (err) {
    return handleError(err);
  }
};

// delete link
export const deleteLink = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const decodedToken = authenticate(event);
    if (!decodedToken) {
      throw HttpError(401);
    }

    const id = event.pathParameters?.id as string | undefined;
    if (!id) {
      throw HttpError(400, 'Missed ID Parameter');
    }

    await getLinkSchema.validate(id);

    const deleteLinkCommand = new DeleteItemCommand({
      TableName: tableName,
      Key: {
        id: { S: id! },
      },
    });

    await docClient.send(deleteLinkCommand);

    return {
      statusCode: 204,
      body: '',
    };
  } catch (err) {
    return handleError(err);
  }
};

// get links
export const getLinks = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const decodedToken = authenticate(event);
    if (!decodedToken) {
      throw HttpError(401);
    }

    const ownerId = decodedToken?.id;

    const getLinksCommand = new QueryCommand({
      TableName: tableName,
      IndexName: 'get-owner-links-index',
      KeyConditionExpression: 'ownerId = :ownerId',
      ExpressionAttributeValues: {
        ':ownerId': ownerId,
      },
    });

    const response = await docClient.send(getLinksCommand);

    if (!response.Items) {
      throw HttpError(404);
    }

    return {
      statusCode: 200,
      body: JSON.stringify(response.Items),
    };
  } catch (err) {
    return handleError(err);
  }
};

// get short link
export const getLink = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id as string | undefined;
    if (!id) {
      throw HttpError(400, 'Missed ID Parameter');
    }

    await getLinkSchema.validate(id);

    const updateLinkCommand = new UpdateCommand({
      TableName: tableName,
      Key: {
        id,
      },
      UpdateExpression: 'set visit = visit + :increment',
      ExpressionAttributeValues: {
        ':increment': 1,
      },
      ReturnValues: 'ALL_NEW',
    });

    const response = await docClient.send(updateLinkCommand);

    if (!response.Attributes) {
      throw HttpError(404);
    }

    return {
      statusCode: 302,
      headers: {
        Location: response.Attributes?.originUrl,
      },
      body: '',
    };
  } catch (err) {
    return handleError(err);
  }
};
