import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DeleteItemCommand } from '@aws-sdk/client-dynamodb';
import { PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

import { createLinkSchema, getLinkSchema } from '../models/link';

import {
  handleError,
  HttpError,
  generateShortUrl,
  createLinkTable,
  docClientLocal,
  docClientAws,
} from '../helpers';

import { authenticate } from '../middlewares/authenticate';

import 'dotenv/config';
type ProcessEnv = {
  GSI_OWNER_ID_PRIMARY: string;
  LINKS_TABLE_NAME: string;
};
const { GSI_OWNER_ID_PRIMARY, LINKS_TABLE_NAME } = process.env as ProcessEnv;

const docClient = docClientLocal;

// create short link and save in db
export const createLink = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // await createLinkTable();

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
      TableName: LINKS_TABLE_NAME,
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
      TableName: LINKS_TABLE_NAME,
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
      TableName: LINKS_TABLE_NAME,
      IndexName: GSI_OWNER_ID_PRIMARY,
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
      TableName: LINKS_TABLE_NAME,
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
