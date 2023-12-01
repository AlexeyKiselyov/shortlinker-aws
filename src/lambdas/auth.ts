import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { v4 } from 'uuid';

import { registerSchema, loginSchema } from '../models/user';

import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

import { HttpError, handleError } from '../helpers';
import { getItemFromDb, putIntoDb, updateDb } from '../helpers/dinamoDbService';

import { NewUser, ProcessEnv, UserData } from '../types';

import 'dotenv/config';

const { TOKEN_SECRET_KEY, TOKEN_EXPIRES, USERS_TABLE_NAME } =
  process.env as ProcessEnv;

// sign up controller
export const register = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const reqBody = JSON.parse(event.body as string);

    await registerSchema.validate(reqBody, { abortEarly: false });

    const { email, password }: UserData = reqBody;

    const user = await getItemFromDb(USERS_TABLE_NAME!, { email });

    if (user.Item) {
      throw HttpError(409, 'Email in use');
    }

    const hashPassword = await bcrypt.hash(String(password), 10);

    const id = v4();

    const payload = {
      id,
      email,
    };

    const accessToken = jwt.sign(payload, TOKEN_SECRET_KEY!, {
      expiresIn: TOKEN_EXPIRES,
    });

    const newUser: NewUser = {
      id,
      email,
      password: hashPassword,
      accessToken,
    };

    await putIntoDb(USERS_TABLE_NAME!, newUser);

    return {
      statusCode: 201,
      body: JSON.stringify({
        id,
        token: accessToken,
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

    const user = await getItemFromDb(USERS_TABLE_NAME!, { email });

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
      email: user.Item.email,
    };

    const accessToken = jwt.sign(payload, TOKEN_SECRET_KEY!, {
      expiresIn: TOKEN_EXPIRES,
    });

    await updateDb(
      USERS_TABLE_NAME!,
      { email },
      { prop: 'accessToken', value: accessToken }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        id: user.Item.id,
        token: accessToken,
      }),
    };
  } catch (e) {
    return handleError(e);
  }
};
