import { HttpError } from './HttpError';

export const validateService = async (
  schema: any,
  data: any
): Promise<void> => {
  try {
    await schema.validate(data, { abortEarly: false });
  } catch (err) {
    throw HttpError(400, err.errors);
  }
};
