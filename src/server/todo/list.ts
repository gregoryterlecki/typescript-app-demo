import { publicProcedure } from '../trpc';
import db from '@/db';

const list = publicProcedure.query(async () => {
  const todos = await db.Todo.list();
  return todos.map((todo) => ({
    ...todo,
    createdAt: todo.createdAt.toString(),
    updatedAt: todo.updatedAt.toString()
  }));
});

export default list;
