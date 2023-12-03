import { APIGatewayProxyEvent } from 'aws-lambda';
import * as jwt from 'jsonwebtoken';

import { DecodedToken, ProcessEnv } from '../types';
import 'dotenv/config';

const { TOKEN_SECRET_KEY } = process.env as ProcessEnv;

export const authenticate = (
  event: APIGatewayProxyEvent
): DecodedToken | null => {
  const authorization = event.headers?.Authorization || '';
  const [bearer, token] = authorization.split(' ');
  if (bearer !== 'Bearer') {
    return null;
  }

  try {
    const decodedToken = jwt.verify(token, TOKEN_SECRET_KEY!) as DecodedToken;
    return decodedToken;
  } catch {
    return null;
  }
};
