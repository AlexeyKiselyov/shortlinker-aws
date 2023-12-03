import { APIGatewayProxyResult } from 'aws-lambda';
import { CustomError } from '../types';

const headers = {
  'content-type': 'application/json',
};

export const handleError = (err: CustomError): APIGatewayProxyResult => {
  const { status = 500, message = 'Server error' } = err;
  return {
    statusCode: status,
    headers,
    body: JSON.stringify({
      error: message,
    }),
  };
};
