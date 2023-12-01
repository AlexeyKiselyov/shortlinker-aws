export const durationToExpireDate = (duration: string): string => {
  let expireDate = new Date();

  if (duration === '10-minutes') {
    expireDate.setMinutes(expireDate.getMinutes() + 10);
    return expireDate.toISOString();
  }
  if (duration === '1-day') {
    expireDate.setDate(expireDate.getDate() + 1);
    return expireDate.toISOString();
  }
  if (duration === '3-days') {
    expireDate.setDate(expireDate.getDate() + 3);
    return expireDate.toISOString();
  }
  if (duration === '7-days') {
    expireDate.setDate(expireDate.getDate() + 7);
    return expireDate.toISOString();
  } else {
    return new Date('2050-01-01').toISOString();
  }
};
