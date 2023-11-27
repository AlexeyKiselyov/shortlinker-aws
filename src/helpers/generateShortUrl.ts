import * as crypto from 'crypto';

export const generateShortUrl = (url: string, userId: string): string => {
  const hashedUrl = crypto
    .createHash('md5')
    .update(url + userId)
    .digest('hex')
    .slice(0, 6);

  return hashedUrl;
};
