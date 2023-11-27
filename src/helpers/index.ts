import {
  docClientLocal,
  docClientAws,
  createLinkTable,
  createUserTable,
} from './createTables';
import { generateShortUrl } from './generateShortUrl';
import { handleError } from './handleError';
import { HttpError } from './HttpError';

export {
  docClientLocal,
  docClientAws,
  createLinkTable,
  createUserTable,
  generateShortUrl,
  handleError,
  HttpError,
};
