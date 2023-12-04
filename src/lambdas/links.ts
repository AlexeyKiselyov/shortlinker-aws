import 'dotenv/config';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { createLinkSchema, getLinkSchema } from '../models/link';

import {
  handleError,
  HttpError,
  generateShortUrl,
  durationToExpireDate,
  sendEmail,
} from '../helpers';

import { authenticate } from '../middlewares/authenticate';

import { NewLink } from '../types';
import {
  deleteFromDb,
  getItemsFromDb,
  putIntoDb,
  updateDb,
} from '../helpers/dinamoDbService';

type ProcessEnv = {
  GSI_OWNER_ID_PRIMARY: string;
  LINKS_TABLE_NAME: string;
};
const { GSI_OWNER_ID_PRIMARY, LINKS_TABLE_NAME } = process.env as ProcessEnv;

// create short link and save in db
export const createLink = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const decodedToken = authenticate(event);
    if (!decodedToken) {
      throw HttpError(401);
    }
    const { id: userId, email } = decodedToken;

    const reqBody = JSON.parse(event.body as string);

    await createLinkSchema.validate(reqBody);

    const { originUrl, duration } = reqBody;

    const expireDate = durationToExpireDate(duration);

    const shortUrl = generateShortUrl(originUrl, userId);

    const newLink: NewLink = {
      id: shortUrl,
      originUrl,
      expireDate,
      visit: 0,
      ownerId: userId,
      ownerEmail: email,
    };

    await putIntoDb(LINKS_TABLE_NAME, newLink);

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

    const result = await deleteFromDb(LINKS_TABLE_NAME, { id: { S: id! } });
    if (!result.Attributes) {
      throw HttpError(404);
    }

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

    const response = await getItemsFromDb(
      LINKS_TABLE_NAME,
      GSI_OWNER_ID_PRIMARY,
      { prop: 'ownerId', value: ownerId }
    );

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

    const response = await updateDb(
      LINKS_TABLE_NAME,
      { id },
      { prop: 'visit', value: null, increment: 1 }
    );

    if (!response.Attributes) {
      throw HttpError(404);
    }

    if (
      response.Attributes.expireDate === new Date('2050-01-01').toISOString()
    ) {
      const ownerEmail: string = response.Attributes.ownerEmail;
      await deleteFromDb(LINKS_TABLE_NAME, { id: { S: id } });
      await sendEmail({ email: ownerEmail, id });
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
