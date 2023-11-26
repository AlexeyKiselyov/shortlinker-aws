import { docClient, createLinkTable, createUserTable } from './createTables';
import { generateShortUrl } from './generateShortUrl';
import { handleError } from './handleError';
import { HttpError } from './HttpError';

export {
  docClient,
  createLinkTable,
  createUserTable,
  generateShortUrl,
  handleError,
  HttpError,
};
