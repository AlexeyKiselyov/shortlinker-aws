import {
  docClientLocal,
  createLinkTable,
  createUserTable,
} from './createTables';
import { generateShortUrl } from './generateShortUrl';
import { durationToExpireDate } from './durationToDate';
import { handleError } from './handleError';
import { HttpError } from './HttpError';
import { sendEmail } from './sendEmail';
import { docClientAws } from './dinamoDbService';

export {
  docClientLocal,
  docClientAws,
  createLinkTable,
  createUserTable,
  generateShortUrl,
  durationToExpireDate,
  handleError,
  HttpError,
  sendEmail,
};
