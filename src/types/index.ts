export type UserData = { email: string; password: string };

export type DecodedToken = {
  id: string;
  email: string;
};

export type Key = {
  email?: string;
  id?: string;
};

export type NewUser = {
  id: string;
  email: string;
  password: string;
  accessToken: string;
};

export type NewLink = {
  id: string;
  originUrl: string;
  expireDate: Date | string;
  visit: number;
  ownerId: string;
  ownerEmail: string;
};

export type ConditionExpression = {
  prop: string;
  value: string | null;
  increment?: number;
};

export type QueryExpression = {
  prop: string;
  value: string;
};

export type DeleteItem = {
  id: { S: string };
};

export type EmailToSend = {
  email: string;
  message?: string;
  id?: string;
};

export type SQSEvent = {
  Records: Array<{ body: string }>;
};

export interface CustomError extends Error {
  status?: number;
}

export type ProcessEnv = {
  TOKEN_SECRET_KEY?: string;
  TOKEN_EXPIRES?: string;
  USERS_TABLE_NAME?: string;
  LINKS_TABLE_NAME?: string;
  GSI_OWNER_ID_PRIMARY?: string;
  REGION_AWS_FOR_SQS?: string;
  SES_EMAIL_SENDER?: string;
  QUEUE_URL?: string;
};
