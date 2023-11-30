import * as yup from 'yup';

import { DURATION_STRINGS } from '../helpers/constants';

export const createLinkSchema = yup.object().shape({
  originUrl: yup.string().url().required(),
  duration: yup.string().oneOf(DURATION_STRINGS).required(),
});

export const getLinkSchema = yup.string().length(6).required();
