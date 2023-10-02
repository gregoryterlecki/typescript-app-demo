import dbClient from '../client';

export const list = async () => {
  return dbClient.todo.findMany({
    select: {
      id: true,
      text: true,
      createdAt: true,
      updatedAt: true
    }
  });
};
