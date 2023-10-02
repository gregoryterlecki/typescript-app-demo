import dbClient from '../client';

export const deleteById = async (id: string) => {
  return dbClient.todo.delete({
    where: {
      id: id
    }
  });
};
