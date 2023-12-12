export const handler = async () => {
  return {
    statusCode: 404,
    body: JSON.stringify({
      message: 'Not Found',
    }),
  };
};
