import * as yup from 'yup';

const validDurationStrings = ['one-time', '1-day', '3-days', '7-days'];

export const createLinkSchema = yup.object().shape({
  originUrl: yup.string().url().required(),
  duration: yup.string().oneOf(validDurationStrings).required(),
});

export const getLinkSchema = yup.string().length(6).required();
