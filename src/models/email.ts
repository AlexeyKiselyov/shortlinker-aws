import * as yup from 'yup';

export const emailToSendSchema = yup.object({
  email: yup.string().email().required(),
  message: yup.string().optional(),
  id: yup.string().optional(),
});
