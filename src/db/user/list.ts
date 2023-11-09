import dbClient from '../client';

export const list = async () => {
  return dbClient.user.findMany({
    select: {
      firstName: true,
      lastName: true,
      email: true
    }
  });
};
