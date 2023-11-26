import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  GetCommand,
  PutCommand,
  UpdateCommand,
  DynamoDBDocumentClient,
} from '@aws-sdk/lib-dynamodb';

import { v4 } from 'uuid';

import { registerSchema, loginSchema } from '../models/user';

import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

import { HttpError, handleError, createUserTable, docClient } from '../helpers';

import 'dotenv/config';
type ProcessEnv = {
  TOKEN_SECRET_KEY: string;
  TOKEN_EXPIRES: string;
};

const { TOKEN_SECRET_KEY, TOKEN_EXPIRES } = process.env as ProcessEnv;

// db local setup
const tableName = 'UsersTable';

docClient;

// sign up controller
export const register = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // await createUserTable();

    const reqBody = JSON.parse(event.body as string);

    await registerSchema.validate(reqBody, { abortEarly: false });

    const { email, password } = reqBody;

    const getUserCommand = new GetCommand({
      TableName: tableName,
      Key: {
        email,
      },
    });

    const user = await docClient.send(getUserCommand);

    if (user.Item) {
      HttpError(409, 'Email in use');
    }

    const hashPassword = await bcrypt.hash(String(password), 10);

    const id = v4();

    const payload = {
      id,
    };

    const token = jwt.sign(payload, TOKEN_SECRET_KEY, {
      expiresIn: TOKEN_EXPIRES,
    });

    const newUser = {
      id,
      email,
      password: hashPassword,
      token,
    };

    const createUserCommand = new PutCommand({
      TableName: tableName,
      Item: newUser,
    });

    await docClient.send(createUserCommand);

    return {
      statusCode: 201,
      body: JSON.stringify({
        id,
        token,
      }),
    };
  } catch (err) {
    return handleError(err);
  }
};

// sign in controller
export const login = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const reqBody = JSON.parse(event.body as string);

    await loginSchema.validate(reqBody, { abortEarly: false });

    const { email, password } = reqBody;

    const getUserCommand = new GetCommand({
      TableName: tableName,
      Key: {
        email,
      },
    });

    const user = await docClient.send(getUserCommand);
    if (!user.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'No user with this data was found',
        }),
      };
    }

    const passwordCompare = await bcrypt.compare(
      String(password),
      user.Item.password
    );

    if (!passwordCompare) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: 'Email or password invalid',
        }),
      };
    }

    const payload = {
      id: user.Item.id,
    };

    const token = jwt.sign(payload, TOKEN_SECRET_KEY, {
      expiresIn: TOKEN_EXPIRES,
    });

    const updateUserCommand = new UpdateCommand({
      TableName: tableName,
      Key: {
        email,
      },
      UpdateExpression: 'set #token = :token',
      ExpressionAttributeNames: {
        '#token': 'token',
      },
      ExpressionAttributeValues: {
        ':token': token,
      },
    });

    await docClient.send(updateUserCommand);

    return {
      statusCode: 200,
      body: JSON.stringify({
        id: user.Item.id,
        token,
      }),
    };
  } catch (e) {
    return handleError(e);
  }
};
