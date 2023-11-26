const headers = {
  'content-type': 'application/json',
};

interface CustomError extends Error {
  status?: number;
}

export const handleError = (err: CustomError) => {
  const { status = 500, message = 'Server error' } = err;
  return {
    statusCode: status,
    headers,
    body: JSON.stringify({
      error: message,
    }),
  };
};
