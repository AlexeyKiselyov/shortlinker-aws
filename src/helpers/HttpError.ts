type HttpStatusMessages = {
  [key: number]: string;
};

const messages: HttpStatusMessages = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not found',
  409: 'Conflict',
};

export const HttpError = (
  status: number,
  message: string = messages[status]
): Error => {
  const error = new Error(message);
  (error as any).status = status;
  return error;
};
